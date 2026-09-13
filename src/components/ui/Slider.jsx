import './Slider.css';

export default function Slider({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="slider-field">
      {label && (
        <div className="slider-field__row">
          <label>{label}</label>
          <span className="slider-field__value">
            {value}
            {unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-field__input"
      />
    </div>
  );
}
