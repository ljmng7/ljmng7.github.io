import { useEffect, useRef, useState } from "react";
import { loadContributionPayload } from "../data/contributions";
import type { ContributionLevel, ContributionPayload } from "../types/contributions";
import { useLanguage, type Language } from "./LanguageProvider";
import { MagicCard } from "./MagicCard";
import { Pointer } from "./Pointer";

const ROWS = 7;
const COLUMNS = 26;
const CELL_COUNT = ROWS * COLUMNS;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PALETTES = {
  light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
} as const;
const LABEL_COLORS = {
  light: "#59636e",
  dark: "#8b949e"
} as const;
const INTERACTION_SCALES = [1.22, 1.13, 1.06] as const;

interface GridLayout {
  gap: number;
  gridHeight: number;
  gridWidth: number;
  offsetX: number;
  offsetY: number;
  squareSize: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const initialGridStart = () => {
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const gridEnd = new Date(todayUtc);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));

  const gridStart = new Date(gridEnd);
  gridStart.setUTCDate(gridStart.getUTCDate() - (CELL_COUNT - 1));
  return gridStart;
};

const accessibleDateRange = (startDate: Date, endDate: Date, language: Language) => {
  const dateFormatter = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
  const start = dateFormatter.format(startDate);
  const end = dateFormatter.format(endDate);
  return language === "zh"
    ? `GitHub 贡献记录：${start}至${end}`
    : `GitHub contribution activity from ${start} to ${end}`;
};

export function ContributionGrid() {
  const { language, messages } = useLanguage();
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ariaLabel, setAriaLabel] = useState<string>(messages.contribution.lastSixMonths);

  useEffect(() => {
    setAriaLabel(messages.contribution.lastSixMonths);
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    const interactionCanvas = interactionCanvasRef.current;
    const context = canvas?.getContext("2d");
    const interactionContext = interactionCanvas?.getContext("2d");

    if (!shell || !canvas || !interactionCanvas || !context || !interactionContext) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isDarkTheme = () => document.documentElement.classList.contains("dark");
    const noiseLevels = Array.from({ length: CELL_COUNT }, () => Math.floor(Math.random() * 5));
    const settleOrder = Array.from({ length: CELL_COUNT }, (_, index) => index)
      .sort(() => Math.random() - 0.5)
      .reduce<number[]>((order, index, position) => {
        order[index] = position / CELL_COUNT;
        return order;
      }, []);

    let gridStart = initialGridStart();
    let contributionLevels: ContributionLevel[] = Array(CELL_COUNT).fill(0) as ContributionLevel[];
    let animationStart = performance.now();
    let lastNoiseUpdate = 0;
    let settled = reduceMotion;
    let animationFrameId = 0;
    let framePending = false;
    let disposed = false;
    let hoveredCell: { column: number; row: number } | null = null;
    let gridLayout: GridLayout | null = null;
    let lastFrameTimestamp = animationStart;
    let viewportWidth = 1;
    let viewportHeight = 1;
    let shellBounds = shell.getBoundingClientRect();
    let pendingPointer: { clientX: number; clientY: number } | null = null;
    let pointerFrameId = 0;
    let baseDirty = true;
    const interactionScales = Array<number>(CELL_COUNT).fill(1);
    const fontFamily = getComputedStyle(shell).fontFamily;
    const monthFormatter = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
      month: "short",
      timeZone: "UTC",
    });
    const weekdayLabels = [
      [1, messages.contribution.weekdays[0]],
      [3, messages.contribution.weekdays[1]],
      [5, messages.contribution.weekdays[2]],
    ] as const;

    const hexToRgb = (hex: string) => {
      const value = Number.parseInt(hex.slice(1), 16);
      return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
    };

    const mixColor = (from: string, to: string, progress: number) => {
      const start = hexToRgb(from);
      const end = hexToRgb(to);
      const channels = start.map((value, index) =>
        Math.round(value + (end[index] - value) * progress)
      );
      return `rgb(${channels.join(", ")})`;
    };

    const drawSquare = (
      targetContext: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number
    ) => {
      targetContext.beginPath();
      if (typeof targetContext.roundRect === "function") {
        targetContext.roundRect(x, y, size, size, Math.min(2.2, size * 0.24));
      } else {
        targetContext.rect(x, y, size, size);
      }
      targetContext.fill();
    };

    const scheduleDraw = () => {
      if (disposed || framePending) return;
      framePending = true;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    const updateLayout = (width: number, height: number) => {
      viewportWidth = Math.max(width, 1);
      viewportHeight = Math.max(height, 1);

      const compact = viewportWidth < 520;
      const gap = compact ? 2 : 4;
      const labelGutter = compact ? 25 : 35;
      const topGutter = compact ? 19 : 25;
      const rightPadding = compact ? 8 : 12;
      const bottomPadding = compact ? 8 : 11;
      const availableWidth = viewportWidth - labelGutter - rightPadding;
      const availableHeight = viewportHeight - topGutter - bottomPadding;
      const squareSize = clamp(
        Math.min(
          (availableWidth - gap * (COLUMNS - 1)) / COLUMNS,
          (availableHeight - gap * (ROWS - 1)) / ROWS
        ),
        4,
        18
      );
      const gridWidth = squareSize * COLUMNS + gap * (COLUMNS - 1);
      const gridHeight = squareSize * ROWS + gap * (ROWS - 1);
      const contentWidth = labelGutter + gridWidth + rightPadding;
      const contentHeight = topGutter + gridHeight + bottomPadding;
      const offsetX = Math.max(
        (viewportWidth - contentWidth) / 2 + labelGutter,
        labelGutter
      );
      const offsetY = Math.max(
        (viewportHeight - contentHeight) / 2 + topGutter,
        topGutter
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(viewportWidth * dpr);
      const pixelHeight = Math.round(viewportHeight * dpr);

      if (
        canvas.width !== pixelWidth ||
        canvas.height !== pixelHeight ||
        interactionCanvas.width !== pixelWidth ||
        interactionCanvas.height !== pixelHeight
      ) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        interactionCanvas.width = pixelWidth;
        interactionCanvas.height = pixelHeight;
      }

      gridLayout = { gap, gridHeight, gridWidth, offsetX, offsetY, squareSize };
      shellBounds = shell.getBoundingClientRect();
      baseDirty = true;
    };

    const draw = (timestamp = performance.now()) => {
      if (disposed || !gridLayout) return;
      framePending = false;

      const width = viewportWidth;
      const height = viewportHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      interactionContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      interactionContext.clearRect(0, 0, width, height);

      const compact = width < 520;
      const { gap, offsetX, offsetY, squareSize } = gridLayout;
      const rightPadding = compact ? 8 : 12;
      const palette = isDarkTheme() ? PALETTES.dark : PALETTES.light;
      const labelColor = isDarkTheme() ? LABEL_COLORS.dark : LABEL_COLORS.light;
      const elapsed = timestamp - animationStart;
      const settlingCompleted = !settled && elapsed >= 1800;
      if (settlingCompleted) settled = true;
      const frameDuration = Math.min(Math.max(timestamp - lastFrameTimestamp, 0), 40);
      const interactionProgress = reduceMotion ? 1 : 1 - Math.exp(-frameDuration / 58);
      let interactionAnimating = false;

      for (let column = 0; column < COLUMNS; column += 1) {
        for (let row = 0; row < ROWS; row += 1) {
          const index = column * ROWS + row;
          const distance = hoveredCell
            ? Math.max(
                Math.abs(column - hoveredCell.column),
                Math.abs(row - hoveredCell.row)
              )
            : Number.POSITIVE_INFINITY;
          const targetScale = distance <= 2 ? INTERACTION_SCALES[distance] : 1;
          const nextScale =
            interactionScales[index] +
            (targetScale - interactionScales[index]) * interactionProgress;

          interactionScales[index] = Math.abs(targetScale - nextScale) < 0.0005
            ? targetScale
            : nextScale;
          interactionAnimating ||= interactionScales[index] !== targetScale;
        }
      }

      lastFrameTimestamp = timestamp;

      if (!settled && elapsed < 1000 && timestamp - lastNoiseUpdate > 82) {
        for (let index = 0; index < CELL_COUNT; index += 1) {
          if (Math.random() < 0.3) {
            const roll = Math.random();
            noiseLevels[index] =
              roll < 0.56 ? 0 : roll < 0.76 ? 1 : roll < 0.88 ? 2 : roll < 0.96 ? 3 : 4;
          }
        }
        lastNoiseUpdate = timestamp;
      }

      const cellFills = Array<string>(CELL_COUNT);
      for (let column = 0; column < COLUMNS; column += 1) {
        for (let row = 0; row < ROWS; row += 1) {
          const index = column * ROWS + row;
          const targetLevel = contributionLevels[index];
          let fill: string = palette[targetLevel];

          if (!settled && elapsed < 1000) {
            fill = palette[noiseLevels[index]];
          } else if (!settled) {
            const localProgress = clamp(
              (elapsed - 1000 - settleOrder[index] * 420) / 380,
              0,
              1
            );
            const easedProgress = 1 - (1 - localProgress) ** 3;
            fill = mixColor(palette[noiseLevels[index]], palette[targetLevel], easedProgress);
          }

          cellFills[index] = fill;
        }
      }

      const shouldDrawBase = !settled || settlingCompleted || baseDirty;
      if (shouldDrawBase) {
        context.clearRect(0, 0, width, height);
        context.fillStyle = labelColor;
        context.font = `500 ${compact ? 9 : 11}px ${fontFamily}`;
        context.textBaseline = "middle";
        context.textAlign = "right";

        weekdayLabels.forEach(([row, label]) => {
          context.fillText(
            label,
            offsetX - (compact ? 5 : 8),
            offsetY + row * (squareSize + gap) + squareSize / 2
          );
        });

        const startMonthKey = `${gridStart.getUTCFullYear()}-${gridStart.getUTCMonth()}`;
        const monthLabels = [{ column: 0, label: monthFormatter.format(gridStart) }];
        const seenMonths = new Set([startMonthKey]);

        for (let column = 0; column < COLUMNS; column += 1) {
          for (let row = 0; row < ROWS; row += 1) {
            const date = new Date(gridStart);
            date.setUTCDate(gridStart.getUTCDate() + column * ROWS + row);
            const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;

            if (date.getUTCDate() === 1 && !seenMonths.has(monthKey)) {
              const previousColumn = monthLabels.at(-1)?.column;
              monthLabels.push({
                column: previousColumn === column ? Math.min(column + 1, COLUMNS - 1) : column,
                label: monthFormatter.format(date)
              });
              seenMonths.add(monthKey);
            }
          }
        }

        context.textBaseline = "bottom";
        context.textAlign = "left";
        monthLabels.forEach(({ column, label }) => {
          const naturalX = offsetX + column * (squareSize + gap);
          const textWidth = context.measureText(label).width;
          const labelX = Math.min(naturalX, width - rightPadding - textWidth);
          context.fillText(label, labelX, offsetY - (compact ? 4 : 6));
        });

        for (let column = 0; column < COLUMNS; column += 1) {
          for (let row = 0; row < ROWS; row += 1) {
            const index = column * ROWS + row;
            context.fillStyle = cellFills[index];
            drawSquare(
              context,
              offsetX + column * (squareSize + gap),
              offsetY + row * (squareSize + gap),
              squareSize
            );
          }
        }

        baseDirty = false;
      }

      for (let column = 0; column < COLUMNS; column += 1) {
        for (let row = 0; row < ROWS; row += 1) {
          const index = column * ROWS + row;
          const scale = interactionScales[index];
          if (scale <= 1.0005) continue;

          const scaledSize = squareSize * scale;
          const scaleOffset = (scaledSize - squareSize) / 2;

          interactionContext.fillStyle = cellFills[index];
          drawSquare(
            interactionContext,
            offsetX + column * (squareSize + gap) - scaleOffset,
            offsetY + row * (squareSize + gap) - scaleOffset,
            scaledSize
          );
        }
      }

      if ((!settled && elapsed < 1800) || interactionAnimating) {
        scheduleDraw();
      }
    };

    const applyContributionData = (payload: ContributionPayload) => {
      if (DATE_PATTERN.test(payload.startDate)) {
        gridStart = new Date(`${payload.startDate}T00:00:00Z`);
      }

      const levelByDate = new Map(payload.days.map((day) => [day.date, day.level]));
      contributionLevels = Array.from({ length: CELL_COUNT }, (_, index) => {
        const date = new Date(gridStart);
        date.setUTCDate(gridStart.getUTCDate() + index);
        return levelByDate.get(date.toISOString().slice(0, 10)) ?? 0;
      });

      if (DATE_PATTERN.test(payload.endDate)) {
        const endDate = new Date(`${payload.endDate}T00:00:00Z`);
        setAriaLabel(accessibleDateRange(gridStart, endDate, language));
      }

      if (reduceMotion || settled) {
        settled = true;
        baseDirty = true;
        scheduleDraw();
      }
    };

    void loadContributionPayload().then((payload) => {
      if (!disposed && payload) applyContributionData(payload);
    });

    const flushHoveredCell = () => {
      pointerFrameId = 0;
      if (!gridLayout) return;

      const pointerPosition = pendingPointer;
      pendingPointer = null;
      if (!pointerPosition) return;

      const pointerX = pointerPosition.clientX - shellBounds.left;
      const pointerY = pointerPosition.clientY - shellBounds.top;
      const { gap, gridHeight, gridWidth, offsetX, offsetY, squareSize } = gridLayout;
      const step = squareSize + gap;
      const insideGrid =
        pointerX >= offsetX - gap / 2 &&
        pointerX <= offsetX + gridWidth + gap / 2 &&
        pointerY >= offsetY - gap / 2 &&
        pointerY <= offsetY + gridHeight + gap / 2;

      const nextHoveredCell = insideGrid
        ? {
            column: clamp(Math.round((pointerX - offsetX - squareSize / 2) / step), 0, COLUMNS - 1),
            row: clamp(Math.round((pointerY - offsetY - squareSize / 2) / step), 0, ROWS - 1)
          }
        : null;

      if (
        nextHoveredCell?.column === hoveredCell?.column &&
        nextHoveredCell?.row === hoveredCell?.row
      ) {
        return;
      }

      hoveredCell = nextHoveredCell;
      scheduleDraw();
    };

    const updateHoveredCell = (event: PointerEvent) => {
      pendingPointer = { clientX: event.clientX, clientY: event.clientY };
      if (!pointerFrameId) {
        pointerFrameId = window.requestAnimationFrame(flushHoveredCell);
      }
    };

    const refreshShellBounds = () => {
      shellBounds = shell.getBoundingClientRect();
    };

    const clearHoveredCell = () => {
      pendingPointer = null;
      if (pointerFrameId) {
        window.cancelAnimationFrame(pointerFrameId);
        pointerFrameId = 0;
      }
      if (!hoveredCell) return;
      hoveredCell = null;
      scheduleDraw();
    };

    const redraw = () => {
      baseDirty = true;
      updateLayout(shell.clientWidth, shell.clientHeight);
      scheduleDraw();
    };
    const resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            updateLayout(entry.contentRect.width, entry.contentRect.height);
            scheduleDraw();
          })
        : null;
    const themeObserver = new MutationObserver(redraw);

    updateLayout(shell.clientWidth, shell.clientHeight);
    resizeObserver?.observe(shell);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    if (!resizeObserver) {
      window.addEventListener("resize", redraw, { passive: true });
    }
    if (supportsHover) {
      shell.addEventListener("pointerenter", refreshShellBounds, { passive: true });
      shell.addEventListener("pointermove", updateHoveredCell, { passive: true });
      shell.addEventListener("pointerleave", clearHoveredCell, { passive: true });
    }
    draw(animationStart);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrameId);
      window.cancelAnimationFrame(pointerFrameId);
      resizeObserver?.disconnect();
      themeObserver.disconnect();
      if (!resizeObserver) {
        window.removeEventListener("resize", redraw);
      }
      if (supportsHover) {
        shell.removeEventListener("pointerenter", refreshShellBounds);
        shell.removeEventListener("pointermove", updateHoveredCell);
        shell.removeEventListener("pointerleave", clearHoveredCell);
      }
    };
  }, [language, messages]);

  return (
    <MagicCard
      className="contribution-grid-shell"
      gradientColor="var(--contribution-card-glow)"
      gradientFrom="var(--contribution-card-border-from)"
      gradientOpacity={1}
      gradientSize={180}
      gradientTo="var(--contribution-card-border-to)"
    >
      <div
        ref={shellRef}
        className="contribution-grid-static"
        role="img"
        aria-label={ariaLabel}
      >
        <canvas ref={canvasRef} className="contribution-grid-canvas" aria-hidden="true" />
      </div>
      <canvas
        ref={interactionCanvasRef}
        className="contribution-grid-interaction-canvas"
        aria-hidden="true"
      />
      <Pointer className="contribution-grid-pointer">
        <span aria-hidden="true">👆</span>
      </Pointer>
    </MagicCard>
  );
}
