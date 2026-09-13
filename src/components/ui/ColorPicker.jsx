import { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';

const SWATCHES = [
  '#F5C518', '#D4A017', '#ffffff', '#000000', '#1a1a1a',
  '#8b0000', '#1a0033', '#00332b', '#a0a0a0', '#3a3a3a',
];

export default function ColorPicker({ label, value, onChange, opacity, onOpacityChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="color-picker" ref={ref}>
      {label && <label className="color-picker__label">{label}</label>}
      <div className="color-picker__row">
        <button
          className="color-picker__swatch"
          style={{ background: value }}
          onClick={() => setOpen((o) => !o)}
        />
        <input
          className="color-picker__hex"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {open && (
        <div className="color-picker__popover glass">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="color-picker__native"
          />
          <div className="color-picker__swatches">
            {SWATCHES.map((c) => (
              <button
                key={c}
                className="color-picker__swatch-sm"
                style={{ background: c }}
                onClick={() => onChange(c)}
              />
            ))}
          </div>
          {onOpacityChange && (
            <div className="color-picker__opacity">
              <span>Opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={opacity ?? 1}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
