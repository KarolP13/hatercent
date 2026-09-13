import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { useDesignState } from '../context/DesignContext';
import './CanvasPreview.css';

const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function buildBottomFade(fade) {
  const { r, g, b } = hexToRgb(fade.color);
  const solidAlpha = 0.55 + fade.intensity * 0.42;
  const midAlpha = fade.intensity * 0.55;
  return `linear-gradient(to top,
    rgba(${r}, ${g}, ${b}, ${solidAlpha}) 0%,
    rgba(${r}, ${g}, ${b}, ${solidAlpha}) 12%,
    rgba(${r}, ${g}, ${b}, ${midAlpha}) 32%,
    rgba(${r}, ${g}, ${b}, 0) 52%)`;
}

function buildImageStyle(bg) {
  const totalScale = 1.04 * (bg.transform.zoom / 100);
  return {
    transform: `translate(${bg.transform.x}%, ${bg.transform.y}%) scale(${totalScale})`,
    filter: `blur(${bg.filters.blur}px) brightness(${bg.filters.brightness}%) contrast(${bg.filters.contrast}%) saturate(${bg.filters.saturate}%) grayscale(${bg.filters.grayscale}%)`,
  };
}

const LOGO_POS_STYLES = {
  'top-left': { top: '5%', left: '5%' },
  'top-center': { top: '5%', left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: '5%', right: '5%' },
  'middle-left': { top: '50%', left: '5%', transform: 'translateY(-50%)' },
  'middle-center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  'middle-right': { top: '50%', right: '5%', transform: 'translateY(-50%)' },
  'bottom-left': { bottom: '5%', left: '5%' },
  'bottom-center': { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: '5%', right: '5%' },
};

const CanvasPreview = forwardRef(function CanvasPreview(_, ref) {
  const state = useDesignState();
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    function recalc() {
      if (!wrapperRef.current) return;
      const { clientWidth, clientHeight } = wrapperRef.current;
      const pad = 48;
      const availW = clientWidth - pad * 2;
      const availH = clientHeight - pad * 2;
      const s = Math.min(availW / state.size.width, availH / state.size.height, 1);
      setScale(s > 0 ? s : 1);
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [state.size.width, state.size.height]);

  const justify = state.text.position === 'top' ? 'flex-start' : state.text.position === 'bottom' ? 'flex-end' : 'center';

  const paddingX = state.size.width * 0.08;
  const paddingTop = state.text.position === 'top' ? state.size.width * 0.12 : paddingX;
  const paddingBottom = state.text.position === 'bottom' ? state.size.width * 0.16 : paddingX;

  return (
    <div className="canvas-wrapper" ref={wrapperRef}>
      <div
        className="canvas-stage"
        style={{
          width: state.size.width,
          height: state.size.height,
          transform: `scale(${scale})`,
        }}
      >
        <div
          ref={ref}
          className="canvas-frame"
          style={{
            width: state.size.width,
            height: state.size.height,
            borderRadius: state.effects.border.radius,
            border: state.effects.border.enabled
              ? `${state.effects.border.width}px solid ${state.effects.border.color}`
              : 'none',
          }}
        >
          <div className="canvas-bg-wrap">
            {state.background.image ? (
              <img
                src={state.background.image}
                alt=""
                className="canvas-bg-img"
                style={buildImageStyle(state.background)}
              />
            ) : (
              <div className="canvas-bg-empty" />
            )}
          </div>

          {!state.background.image && (
            <div className="canvas-empty-hint">Upload a photo to get started</div>
          )}

          {state.effects.vignette.enabled && (
            <div
              className="canvas-vignette"
              style={{
                background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${state.effects.vignette.intensity}) 100%)`,
              }}
            />
          )}

          {state.effects.noise.enabled && (
            <div
              className="canvas-noise"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,${NOISE_SVG}")`,
                opacity: state.effects.noise.intensity,
              }}
            />
          )}

          {state.background.bottomFade.enabled && (
            <div
              className="canvas-bottom-fade"
              style={{ background: buildBottomFade(state.background.bottomFade) }}
            />
          )}

          {state.eyebrow.visible && state.eyebrow.content && (
            <p
              className="canvas-eyebrow"
              style={{ color: state.eyebrow.color, fontSize: state.size.width * 0.016 }}
            >
              {state.eyebrow.content}
            </p>
          )}

          <div
            className="canvas-content"
            style={{
              justifyContent: justify,
              paddingLeft: paddingX,
              paddingRight: paddingX,
              paddingTop,
              paddingBottom,
            }}
          >
            {state.quoteMark.enabled && (
              state.quoteMark.style === 'badge' ? (
                <div
                  className="quote-mark quote-mark--badge"
                  style={{
                    background: state.quoteMark.badgeColor,
                    color: state.quoteMark.badgeTextColor,
                    fontSize: state.size.width * 0.045,
                    width: state.size.width * 0.09,
                    height: state.size.width * 0.09,
                  }}
                >
                  &#8220;&#8221;
                </div>
              ) : (
                <div
                  className="quote-mark quote-mark--minimal"
                  style={{ color: state.quoteMark.color, fontSize: state.size.width * 0.05 }}
                >
                  &#8220;&mdash;&#8221;
                </div>
              )
            )}
            <p
              className="canvas-text"
              style={{
                fontFamily: state.text.fontFamily,
                fontSize: state.text.fontSize,
                fontWeight: state.text.fontWeight,
                color: state.text.color,
                textAlign: state.text.align,
                letterSpacing: state.text.letterSpacing,
                lineHeight: state.text.lineHeight,
                textTransform: state.text.uppercase ? 'uppercase' : 'none',
                textShadow: state.text.shadow.enabled
                  ? `0 4px ${state.text.shadow.blur}px ${state.text.shadow.color}`
                  : 'none',
              }}
            >
              {state.text.content}
            </p>
            {state.attribution.visible && state.attribution.content && (
              <p
                className="canvas-attribution"
                style={{
                  fontFamily: state.attribution.fontFamily,
                  fontSize: state.attribution.fontSize,
                  color: state.attribution.color,
                  textAlign: state.text.align,
                }}
              >
                {state.attribution.content}
              </p>
            )}
          </div>

          {state.logo.visible && (
            <img
              src="/assets/hatercent-logo.png"
              alt="HaterCent"
              className="canvas-logo"
              style={{
                width: state.logo.size,
                opacity: state.logo.opacity,
                ...LOGO_POS_STYLES[state.logo.position],
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default CanvasPreview;
