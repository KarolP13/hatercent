import { useState } from 'react';
import './Section.css';

export default function Section({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`acc-section ${open ? 'is-open' : ''}`}>
      <button className="acc-section__header" onClick={() => setOpen((o) => !o)}>
        <span className="acc-section__title">
          {icon && <span className="acc-section__icon">{icon}</span>}
          {title}
        </span>
        <span className="acc-section__chevron">▾</span>
      </button>
      <div className="acc-section__body">
        <div className="acc-section__body-inner">{children}</div>
      </div>
    </div>
  );
}
