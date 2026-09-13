import { useRef } from 'react';
import { useDesignState, useDesignDispatch, FORMATS, LOGO_POSITIONS, STYLE_PRESETS, FADE_COLOR_PRESETS, FADE_TEXTURES, FRAME_COLOR_PRESETS } from '../context/DesignContext';
import Section from './ui/Section';
import Slider from './ui/Slider';
import ColorPicker from './ui/ColorPicker';
import FontSelector from './ui/FontSelector';
import { exportToImage, copyToClipboard } from '../utils/exportCanvas';
import './Sidebar.css';

export default function Sidebar({ previewRef }) {
  const state = useDesignState();
  const { setPath, patch } = useDesignDispatch();
  const fileInputRef = useRef(null);
  const cutoutInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPath('background.image', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCutoutUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPath('cutout.image', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__scroll">
        <div className="style-presets">
          <label className="field-label" style={{ margin: '10px 0 8px' }}>Quick Style</label>
          <div className="style-presets__grid">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className="style-preset-card"
                style={{ background: preset.swatch }}
                onClick={() => patch(preset.patch)}
                title={preset.description}
              >
                <span className="style-preset-card__quote">&#8220;&#8221;</span>
                <span className="style-preset-card__name">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Section title="Size / Format" icon="⬛">
          <div className="format-grid">
            {FORMATS.map((f) => (
              <button
                key={f.label}
                className={`format-card ${state.size.label === f.label ? 'is-active' : ''}`}
                onClick={() => setPath('size', { ...f })}
              >
                <div
                  className="format-card__preview"
                  style={{ aspectRatio: `${f.width} / ${f.height}` }}
                />
                <span>{f.label}</span>
                <span className="format-card__dims">{f.width}×{f.height}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Photo" icon="🖼️" defaultOpen>
          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleImageUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {state.background.image ? (
              <img src={state.background.image} alt="background" className="dropzone__preview" />
            ) : (
              <span>Drop photo or click to upload</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />

          {state.background.image && (
            <>
              <div className="field-label-row">
                <label className="field-label" style={{ margin: 0 }}>Reposition</label>
                <button
                  className="text-link-btn"
                  onClick={() => setPath('background.transform', { zoom: 100, x: 0, y: 0 })}
                >
                  Recenter
                </button>
              </div>
              <Slider label="Zoom" value={state.background.transform.zoom} min={100} max={300} step={1} unit="%" onChange={(v) => setPath('background.transform.zoom', v)} />
              <Slider label="Move Horizontal" value={state.background.transform.x} min={-50} max={50} step={1} onChange={(v) => setPath('background.transform.x', v)} />
              <Slider label="Move Vertical" value={state.background.transform.y} min={-50} max={50} step={1} onChange={(v) => setPath('background.transform.y', v)} />
            </>
          )}

          <div className="nested-section">
            <Section title="Adjust Photo" icon="🎚️">
              <Slider label="Brightness" value={state.background.filters.brightness} min={0} max={200} unit="%" onChange={(v) => setPath('background.filters.brightness', v)} />
              <Slider label="Contrast" value={state.background.filters.contrast} min={0} max={200} unit="%" onChange={(v) => setPath('background.filters.contrast', v)} />
              <Slider label="Saturation" value={state.background.filters.saturate} min={0} max={200} unit="%" onChange={(v) => setPath('background.filters.saturate', v)} />
              <Slider label="Blur" value={state.background.filters.blur} min={0} max={20} unit="px" onChange={(v) => setPath('background.filters.blur', v)} />
              <Slider label="Grayscale" value={state.background.filters.grayscale} min={0} max={100} unit="%" onChange={(v) => setPath('background.filters.grayscale', v)} />
            </Section>
          </div>

          <label className="toggle-row">
            <span>Bottom Fade (for photo legibility)</span>
            <input
              type="checkbox"
              checked={state.background.bottomFade.enabled}
              onChange={(e) => setPath('background.bottomFade.enabled', e.target.checked)}
            />
          </label>
          {state.background.bottomFade.enabled && (
            <>
              <ColorPicker
                label="Fade Color"
                value={state.background.bottomFade.color}
                onChange={(v) => setPath('background.bottomFade.color', v)}
              />
              <div className="swatch-row">
                {FADE_COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    className="swatch-row__item"
                    style={{ background: c }}
                    onClick={() => setPath('background.bottomFade.color', c)}
                  />
                ))}
              </div>
              <Slider
                label="Intensity"
                value={state.background.bottomFade.intensity}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => setPath('background.bottomFade.intensity', v)}
              />
              <label className="field-label">Fade Texture</label>
              <div className="tab-row">
                {FADE_TEXTURES.map((t) => (
                  <button
                    key={t}
                    className={`tab-btn ${state.background.bottomFade.texture === t ? 'is-active' : ''}`}
                    onClick={() => setPath('background.bottomFade.texture', t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {state.background.bottomFade.texture !== 'none' && (
                <Slider
                  label="Texture Intensity"
                  value={state.background.bottomFade.textureIntensity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => setPath('background.bottomFade.textureIntensity', v)}
                />
              )}
            </>
          )}
        </Section>

        <Section title="Subject Cutout" icon="🫥">
          <p className="section-hint">
            Upload a transparent PNG cutout of just your subject to let it break over the frame border below.
          </p>
          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleCutoutUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => cutoutInputRef.current?.click()}
          >
            {state.cutout.image ? (
              <img src={state.cutout.image} alt="cutout" className="dropzone__preview" />
            ) : (
              <span>Drop cutout PNG or click to upload</span>
            )}
          </div>
          <input
            ref={cutoutInputRef}
            type="file"
            accept="image/png"
            style={{ display: 'none' }}
            onChange={(e) => handleCutoutUpload(e.target.files[0])}
          />
          {state.cutout.image && (
            <>
              <div className="field-label-row">
                <label className="field-label" style={{ margin: 0 }}>Reposition</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="text-link-btn"
                    onClick={() => setPath('cutout.transform', { zoom: 100, x: 0, y: 0 })}
                  >
                    Recenter
                  </button>
                  <button className="text-link-btn" onClick={() => setPath('cutout.image', null)}>
                    Remove
                  </button>
                </div>
              </div>
              <Slider label="Zoom" value={state.cutout.transform.zoom} min={50} max={250} step={1} unit="%" onChange={(v) => setPath('cutout.transform.zoom', v)} />
              <Slider label="Move Horizontal" value={state.cutout.transform.x} min={-50} max={50} step={1} onChange={(v) => setPath('cutout.transform.x', v)} />
              <Slider label="Move Vertical" value={state.cutout.transform.y} min={-50} max={50} step={1} onChange={(v) => setPath('cutout.transform.y', v)} />
            </>
          )}
        </Section>

        <Section title="Text" icon="✍️" defaultOpen>
          <label className="field-label">Quote / Lyric</label>
          <textarea
            className="text-area"
            rows={4}
            value={state.text.content}
            onChange={(e) => setPath('text.content', e.target.value)}
          />
          <label className="field-label">Attribution / Credit</label>
          <input
            className="text-input"
            type="text"
            placeholder="— Artist name"
            value={state.attribution.content}
            onChange={(e) => setPath('attribution.content', e.target.value)}
          />

          <label className="field-label">Font</label>
          <FontSelector value={state.text.fontFamily} onChange={(v) => setPath('text.fontFamily', v)} />

          <Slider label="Font Size" value={state.text.fontSize} min={20} max={220} unit="px" onChange={(v) => setPath('text.fontSize', v)} />

          <ColorPicker label="Text Color" value={state.text.color} onChange={(v) => setPath('text.color', v)} />

          <label className="field-label">Alignment</label>
          <div className="tab-row">
            {['left', 'center', 'right'].map((a) => (
              <button
                key={a}
                className={`tab-btn ${state.text.align === a ? 'is-active' : ''}`}
                onClick={() => setPath('text.align', a)}
              >
                {a}
              </button>
            ))}
          </div>

          <label className="field-label">Position</label>
          <div className="tab-row">
            {['top', 'center', 'bottom'].map((p) => (
              <button
                key={p}
                className={`tab-btn ${state.text.position === p ? 'is-active' : ''}`}
                onClick={() => setPath('text.position', p)}
              >
                {p}
              </button>
            ))}
          </div>

          <label className="toggle-row">
            <span>Quote Mark Accent</span>
            <input
              type="checkbox"
              checked={state.quoteMark.enabled}
              onChange={(e) => setPath('quoteMark.enabled', e.target.checked)}
            />
          </label>
          {state.quoteMark.enabled && (
            <>
              <div className="tab-row">
                {['minimal', 'badge', 'bubble'].map((s) => (
                  <button
                    key={s}
                    className={`tab-btn ${state.quoteMark.style === s ? 'is-active' : ''}`}
                    onClick={() => setPath('quoteMark.style', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {state.quoteMark.style === 'minimal' ? (
                <ColorPicker label="Accent Color" value={state.quoteMark.color} onChange={(v) => setPath('quoteMark.color', v)} />
              ) : (
                <>
                  <ColorPicker label={state.quoteMark.style === 'bubble' ? 'Bubble Color' : 'Badge Color'} value={state.quoteMark.badgeColor} onChange={(v) => setPath('quoteMark.badgeColor', v)} />
                  <ColorPicker label="Icon Color" value={state.quoteMark.badgeTextColor} onChange={(v) => setPath('quoteMark.badgeTextColor', v)} />
                </>
              )}
            </>
          )}

          <div className="nested-section">
            <Section title="Advanced Typography" icon="⚙️">
              <label className="toggle-row">
                <span>Uppercase</span>
                <input
                  type="checkbox"
                  checked={state.text.uppercase}
                  onChange={(e) => setPath('text.uppercase', e.target.checked)}
                />
              </label>

              <div className="tab-row">
                {[{ label: 'Regular', value: 400 }, { label: 'Bold', value: 700 }].map((w) => (
                  <button
                    key={w.value}
                    className={`tab-btn ${state.text.fontWeight === w.value ? 'is-active' : ''}`}
                    onClick={() => setPath('text.fontWeight', w.value)}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              <Slider label="Letter Spacing" value={state.text.letterSpacing} min={-5} max={20} unit="px" onChange={(v) => setPath('text.letterSpacing', v)} />
              <Slider label="Line Height" value={state.text.lineHeight} min={0.8} max={2.5} step={0.05} onChange={(v) => setPath('text.lineHeight', v)} />

              <label className="toggle-row">
                <span>Eyebrow Tag (top label)</span>
                <input
                  type="checkbox"
                  checked={state.eyebrow.visible}
                  onChange={(e) => setPath('eyebrow.visible', e.target.checked)}
                />
              </label>
              {state.eyebrow.visible && (
                <>
                  <input
                    className="text-input"
                    type="text"
                    placeholder="VIA THE SHOW NAME"
                    value={state.eyebrow.content}
                    onChange={(e) => setPath('eyebrow.content', e.target.value)}
                    style={{ marginBottom: 6 }}
                  />
                  <label className="toggle-row">
                    <span>Italic</span>
                    <input
                      type="checkbox"
                      checked={state.eyebrow.italic}
                      onChange={(e) => setPath('eyebrow.italic', e.target.checked)}
                    />
                  </label>
                </>
              )}

              <label className="toggle-row">
                <span>Text Shadow</span>
                <input
                  type="checkbox"
                  checked={state.text.shadow.enabled}
                  onChange={(e) => setPath('text.shadow.enabled', e.target.checked)}
                />
              </label>
              {state.text.shadow.enabled && (
                <Slider label="Shadow Blur" value={state.text.shadow.blur} min={0} max={40} unit="px" onChange={(v) => setPath('text.shadow.blur', v)} />
              )}
            </Section>
          </div>
        </Section>

        <Section title="Logo" icon="🏷️">
          <label className="toggle-row">
            <span>Show HaterCent Logo</span>
            <input
              type="checkbox"
              checked={state.logo.visible}
              onChange={(e) => setPath('logo.visible', e.target.checked)}
            />
          </label>
          {state.logo.visible && (
            <>
              <label className="field-label">Position</label>
              <div className="logo-grid">
                {LOGO_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    className={`logo-pos-btn ${state.logo.position === pos ? 'is-active' : ''}`}
                    onClick={() => setPath('logo.position', pos)}
                    title={pos}
                  >
                    <span className="logo-pos-dot" />
                  </button>
                ))}
              </div>
              <Slider label="Size" value={state.logo.size} min={30} max={300} unit="px" onChange={(v) => setPath('logo.size', v)} />
              <Slider label="Opacity" value={state.logo.opacity} min={0} max={1} step={0.05} onChange={(v) => setPath('logo.opacity', v)} />

              <label className="toggle-row">
                <span>Glow</span>
                <input
                  type="checkbox"
                  checked={state.logo.glow.enabled}
                  onChange={(e) => setPath('logo.glow.enabled', e.target.checked)}
                />
              </label>
              {state.logo.glow.enabled && (
                <>
                  <ColorPicker label="Glow Color" value={state.logo.glow.color} onChange={(v) => setPath('logo.glow.color', v)} />
                  <Slider label="Glow Size" value={state.logo.glow.size} min={100} max={500} step={10} unit="px" onChange={(v) => setPath('logo.glow.size', v)} />
                  <Slider label="Glow Intensity" value={state.logo.glow.intensity} min={0} max={1} step={0.05} onChange={(v) => setPath('logo.glow.intensity', v)} />
                </>
              )}
            </>
          )}
        </Section>

        <Section title="Effects" icon="✨">
          <label className="toggle-row">
            <span>Frame Accent</span>
            <input
              type="checkbox"
              checked={state.effects.frame.enabled}
              onChange={(e) => setPath('effects.frame.enabled', e.target.checked)}
            />
          </label>
          {state.effects.frame.enabled && (
            <>
              <p className="section-hint">
                Sits behind your photo — most visible with a zoomed-out photo or a subject cutout crossing over it.
              </p>
              <ColorPicker label="Frame Color" value={state.effects.frame.color} onChange={(v) => setPath('effects.frame.color', v)} />
              <div className="swatch-row">
                {FRAME_COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    className="swatch-row__item"
                    style={{ background: c }}
                    onClick={() => setPath('effects.frame.color', c)}
                  />
                ))}
              </div>
              <Slider label="Frame Width" value={state.effects.frame.width} min={1} max={16} unit="px" onChange={(v) => setPath('effects.frame.width', v)} />
              <Slider label="Inset" value={state.effects.frame.inset} min={0} max={15} unit="%" onChange={(v) => setPath('effects.frame.inset', v)} />
              <Slider label="Corner Radius" value={state.effects.frame.radius} min={0} max={60} unit="px" onChange={(v) => setPath('effects.frame.radius', v)} />
            </>
          )}

          <label className="toggle-row">
            <span>Border</span>
            <input
              type="checkbox"
              checked={state.effects.border.enabled}
              onChange={(e) => setPath('effects.border.enabled', e.target.checked)}
            />
          </label>
          {state.effects.border.enabled && (
            <>
              <Slider label="Border Width" value={state.effects.border.width} min={1} max={30} unit="px" onChange={(v) => setPath('effects.border.width', v)} />
              <ColorPicker label="Border Color" value={state.effects.border.color} onChange={(v) => setPath('effects.border.color', v)} />
            </>
          )}
          <Slider label="Corner Radius" value={state.effects.border.radius} min={0} max={50} unit="px" onChange={(v) => setPath('effects.border.radius', v)} />

          <label className="toggle-row">
            <span>Vignette</span>
            <input
              type="checkbox"
              checked={state.effects.vignette.enabled}
              onChange={(e) => setPath('effects.vignette.enabled', e.target.checked)}
            />
          </label>
          {state.effects.vignette.enabled && (
            <Slider label="Intensity" value={state.effects.vignette.intensity} min={0} max={1} step={0.05} onChange={(v) => setPath('effects.vignette.intensity', v)} />
          )}

          <label className="toggle-row">
            <span>Grain / Noise</span>
            <input
              type="checkbox"
              checked={state.effects.noise.enabled}
              onChange={(e) => setPath('effects.noise.enabled', e.target.checked)}
            />
          </label>
          {state.effects.noise.enabled && (
            <Slider label="Intensity" value={state.effects.noise.intensity} min={0} max={1} step={0.05} onChange={(v) => setPath('effects.noise.intensity', v)} />
          )}
        </Section>

        <Section title="Export" icon="⬇️" defaultOpen>
          <div className="tab-row">
            {['png', 'jpeg'].map((f) => (
              <button
                key={f}
                className={`tab-btn ${state.export.format === f ? 'is-active' : ''}`}
                onClick={() => setPath('export.format', f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          {state.export.format === 'jpeg' && (
            <Slider label="Quality" value={state.export.quality} min={0.5} max={1} step={0.01} onChange={(v) => setPath('export.quality', v)} />
          )}
          <label className="field-label">Resolution</label>
          <div className="tab-row">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                className={`tab-btn ${state.export.scale === s ? 'is-active' : ''}`}
                onClick={() => setPath('export.scale', s)}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            className="export-btn"
            onClick={() => exportToImage(previewRef, state)}
          >
            Download Graphic
          </button>
          <button
            className="export-btn export-btn--secondary"
            onClick={() => copyToClipboard(previewRef, state)}
          >
            Copy to Clipboard
          </button>
        </Section>
      </div>
    </aside>
  );
}
