import type { COBEOptions } from "cobe";
import {
  CHINA_BOUNDARY_MAP_POINTS,
  CHINA_BOUNDARY_SUPPLEMENT_POINTS,
} from "../data/chinaBoundary";
import { DEFAULT_GLOBE_CONFIG, Globe } from "./Globe";
import { useLanguage } from "./LanguageProvider";

const CHINA_RED: [number, number, number] = [1, 0.06, 0.06];

const PROFILE_GLOBE_CONFIG: COBEOptions = {
  ...DEFAULT_GLOBE_CONFIG,
  phi: (166 * Math.PI) / 180,
  theta: 0.42,
  markers: [
    { location: [26.4204, 111.6134], size: 0.08, color: CHINA_RED },
    { location: [30.2741, 120.1551], size: 0.07, color: CHINA_RED },
    { location: [31.8206, 117.2272], size: 0.07, color: CHINA_RED },
  ],
};

export function GlobePreview() {
  const { messages } = useLanguage();

  return (
    <section
      className="globe-preview"
      data-dock-stop
      aria-label={messages.globe.sectionLabel}
    >
      <div className="globe-preview-stage">
        <Globe
          className="globe-preview-canvas"
          config={PROFILE_GLOBE_CONFIG}
          overlayPoints={CHINA_BOUNDARY_MAP_POINTS}
          supplementalOverlayPoints={CHINA_BOUNDARY_SUPPLEMENT_POINTS}
        />
        <p className="sr-only">{messages.globe.markedLocations}</p>
      </div>
    </section>
  );
}
