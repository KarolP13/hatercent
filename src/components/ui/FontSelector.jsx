import { useState, useRef, useEffect } from 'react';
import { FONTS } from '../../context/DesignContext';
import './FontSelector.css';

export default function FontSelector({ value, onChange }) {
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
    <div className="font-selector" ref={ref}>
      <button
        className="font-selector__trigger"
        style={{ fontFamily: value }}
        onClick={() => setOpen((o) => !o)}
      >
        {value}
        <span className="font-selector__chevron">▾</span>
      </button>
      {open && (
        <div className="font-selector__menu glass">
          {FONTS.map((font) => (
            <button
              key={font}
              className={`font-selector__option ${font === value ? 'is-active' : ''}`}
              style={{ fontFamily: font }}
              onClick={() => {
                onChange(font);
                setOpen(false);
              }}
            >
              {font}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
