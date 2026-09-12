import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "./LanguageProvider";
import { useTheme, type ThemeMode } from "./ThemeProvider";

// Palette values follow pluk-inc/markdown-preview ThemePreset.swift.
// Original retains this homepage's approved colors and typography.
const themes = [
  { id: 'original', name: 'Original', bg: '#F9F9F7', ink: '#30302e', dark: '#2D2D2B', accent: '#0066CC', flavor: 'system', font: 'default' },
  { id: 'quiet', name: 'Quiet', bg: '#4A4A4D', ink: '#EBEBF4', dark: '#4A4A4D', accent: '#99B7C4', flavor: 'dark', font: 'default' },
  { id: 'paper', name: 'Paper', bg: '#EEEDED', ink: '#262626', dark: '#EEEDED', accent: '#DE4A4F', flavor: 'light', font: 'charter' },
  { id: 'bold', name: 'Bold', bg: '#FFFFFF', ink: '#1C1C1E', dark: '#FFFFFF', accent: '#007AFF', flavor: 'light', font: 'default' },
  { id: 'calm', name: 'Calm', bg: '#FDF6E3', ink: '#313D45', dark: '#FDF6E3', accent: '#A0630F', flavor: 'light', font: 'georgia' },
  { id: 'focus', name: 'Focus', bg: '#FFFCF5', ink: '#14120B', dark: '#FFFCF5', accent: '#A0630F', flavor: 'light', font: 'new-york' },
  { id: 'graphite', name: 'Graphite', bg: '#1D1E1F', ink: '#E0E1E0', dark: '#1D1E1F', accent: '#42A2E6', flavor: 'dark', font: 'default' },
  { id: 'dusk', name: 'Dusk', bg: '#0C3742', ink: '#C3CFCC', dark: '#0C3742', accent: '#299385', flavor: 'dark', font: 'default' },
  { id: 'midnight', name: 'Midnight', bg: '#363846', ink: '#FFFFFF', dark: '#363846', accent: '#8BE9FD', flavor: 'dark', font: 'default' },
];

export function ReadingSettings() {
  const { language } = useLanguage();
  const { theme, mode, setMode } = useTheme();
  const zh = language === 'zh';
  const [visible, setVisible] = useState(false);
  const [preset, setPreset] = useState('original');
  const [scale, setScale] = useState(1);
  const [customizing, setCustomizing] = useState(false);
  const [spacing, setSpacing] = useState(1.75);
  const [width, setWidth] = useState(720);
  const [ready, setReady] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('homepage-reading') || '{}');
      if (themes.some(t => t.id === saved.preset)) setPreset(saved.preset);
      if (typeof saved.scale === 'number') setScale(Math.max(.9, Math.min(1.2, saved.scale)));
      if ([1.5, 1.75, 2].includes(saved.spacing)) setSpacing(saved.spacing);
      if ([620, 720, 820].includes(saved.width)) setWidth(saved.width);
      if (['light', 'dark', 'system'].includes(saved.mode)) setMode(saved.mode);
    } catch { /* Defaults remain usable when storage is unavailable. */ }
    setReady(true);
  }, [setMode]);
  useEffect(() => {
    if (!ready) return;
    const chosen = themes.find(t => t.id === preset)!;
    const dark = chosen.flavor === 'dark' || (preset === 'original' && theme === 'dark');
    const root = document.documentElement;
    root.style.setProperty('--paper-color', dark ? chosen.dark : chosen.bg);
    root.style.setProperty('--page-ink', preset === 'original' && dark ? '#eaeae5' : chosen.ink);
    root.style.setProperty('--page-secondary', dark ? '#babbb5' : '#74746c');
    root.style.setProperty('--page-line', dark ? '#ffffff24' : '#20202020');
    root.style.setProperty('--page-hover', dark ? '#ffffff12' : '#00000008');
    root.style.setProperty('--reading-scale', String(scale));
    root.dataset.readingTheme = preset;
    root.dataset.readingFont = chosen.font;
    root.style.setProperty('--reading-accent', preset === 'original' && dark ? '#2997FF' : chosen.accent);
    root.style.setProperty('--reading-line-height', String(spacing));
    root.style.setProperty('--reading-width', `${width}px`);
    try { localStorage.setItem('homepage-reading', JSON.stringify({ preset, scale, mode, spacing, width })); } catch { /* Optional persistence. */ }
  }, [preset, scale, mode, theme, ready, spacing, width]);
  useEffect(() => {
    if (!visible) return;
    const outside = (event: PointerEvent) => { if (!host.current?.contains(event.target as Node)) setVisible(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setVisible(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [visible]);
  return <div className="reading-settings" ref={host}>
    <button ref={trigger} className="reading-trigger" aria-label={zh ? '主题与设置' : 'Themes & Settings'} aria-expanded={visible} aria-controls="reading-panel" onClick={() => setVisible(!visible)}>Aa</button>
    {visible && <section id="reading-panel" className="reading-panel" aria-label={zh ? '主题与设置' : 'Themes & Settings'}>
      <h2>{zh ? '主题与设置' : 'Themes & Settings'}</h2>
      <div className="reading-size"><button disabled={scale <= .9} aria-label={zh ? '缩小字号' : 'Decrease text size'} onClick={() => setScale(s => Math.max(.9, +(s - .1).toFixed(1)))}>A</button><output aria-live="polite">{Math.round(scale * 100)}%</output><button disabled={scale >= 1.2} aria-label={zh ? '放大字号' : 'Increase text size'} onClick={() => setScale(s => Math.min(1.2, +(s + .1).toFixed(1)))}>A</button></div>
      <div className="reading-modes" aria-label={zh ? '颜色模式' : 'Color mode'}>{(['light','dark','system'] as ThemeMode[]).map((m, i) => <button key={m} aria-pressed={mode === m} onClick={() => { setPreset('original'); setMode(m); }}>{(zh ? ['浅色','深色','自动'] : ['Light','Dark','Auto'])[i]}</button>)}</div>
      <div className="reading-themes">{themes.map(t => <button key={t.id} aria-pressed={preset === t.id} style={{ '--swatch-bg': t.bg, '--swatch-ink': t.ink, '--swatch-font': t.font === 'default' ? 'var(--page-font-body)' : t.font === 'charter' ? 'Charter, Georgia, serif' : t.font === 'georgia' ? 'Georgia, serif' : 'ui-serif, New York, Georgia, serif' } as CSSProperties} onClick={() => { setPreset(t.id); setMode(t.flavor as ThemeMode); }}><span>Aa</span><small>{t.id === 'bold' && zh ? '粗体' : t.name}</small></button>)}</div>
      <button className="reading-reset" aria-expanded={customizing} onClick={() => setCustomizing(!customizing)}>{zh ? '自定义排版' : 'Customize'}</button>
      {customizing && <div className="reading-custom">
        <label>{zh ? '行距' : 'Line spacing'}<select value={spacing} onChange={e => setSpacing(Number(e.target.value))}>{[1.5, 1.75, 2].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
        <label>{zh ? '正文宽度' : 'Page width'}<select value={width} onChange={e => setWidth(Number(e.target.value))}>{[620, 720, 820].map(n => <option key={n} value={n}>{n}px</option>)}</select></label>
      </div>}
      <button className="reading-reset reading-reset-default" onClick={() => { setPreset('original'); setScale(1); setSpacing(1.75); setWidth(720); setMode('system'); }}>{zh ? '恢复默认' : 'Reset to default'}</button>
    </section>}
  </div>;
}
