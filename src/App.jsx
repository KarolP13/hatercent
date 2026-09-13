import { useRef, useState } from 'react';
import { DesignProvider } from './context/DesignContext';
import Sidebar from './components/Sidebar';
import CanvasPreview from './components/CanvasPreview';
import './App.css';

function AppShell() {
  const previewRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <img src="/assets/hatercent-logo.png" alt="HaterCent" className="app-header__logo" />
          <div>
            <h1>
              Hater<span className="gold-text">Cent</span>
            </h1>
            <p>Graphic Generator</p>
          </div>
        </div>
        <button className="app-header__drawer-toggle" onClick={() => setDrawerOpen((o) => !o)}>
          {drawerOpen ? 'Close' : 'Edit'}
        </button>
      </header>

      <main className="app-main">
        <div className={`app-main__sidebar ${drawerOpen ? 'is-open' : ''}`}>
          <Sidebar previewRef={previewRef} />
        </div>
        <CanvasPreview ref={previewRef} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DesignProvider>
      <AppShell />
    </DesignProvider>
  );
}
