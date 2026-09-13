import { createContext, useContext, useReducer, useCallback } from 'react';

export const FORMATS = [
  { label: 'Square', width: 1080, height: 1080 },
  { label: 'Portrait', width: 1080, height: 1350 },
  { label: 'Story', width: 1080, height: 1920 },
  { label: 'Landscape', width: 1920, height: 1080 },
  { label: 'Twitter Header', width: 1500, height: 500 },
];

export const FONTS = [
  'Effra Heavy',
  'Anton',
  'Archivo Black',
  'Poppins',
  'Bebas Neue',
  'Oswald',
  'Barlow Condensed',
  'Teko',
  'Montserrat',
  'Inter',
  'Space Grotesk',
  'JetBrains Mono',
  'Roboto Condensed',
  'Playfair Display',
  'Dancing Script',
  'Great Vibes',
  'Caveat',
];

export const QUOTE_MARK_STYLES = ['minimal', 'badge', 'bubble'];

export const FADE_COLOR_PRESETS = ['#000000', '#0a1a5c', '#D4A017', '#3a0d0d', '#0a2e1a'];

export const FADE_TEXTURES = ['none', 'dots', 'wave'];

export const FRAME_COLOR_PRESETS = ['#3ddc97', '#F5C518', '#ffffff', '#ff4d4d', '#4d9fff'];

export const STYLE_PRESETS = [
  {
    name: 'Bleacher Blitz',
    description: 'Minimal quote mark, black fade',
    swatch: 'linear-gradient(160deg, #3a3a3a, #050505)',
    patch: {
      text: { fontFamily: 'Effra Heavy', fontSize: 112, uppercase: true, lineHeight: 0.98, letterSpacing: 0, align: 'center', position: 'bottom' },
      attribution: { fontFamily: 'Inter' },
      quoteMark: { enabled: true, style: 'minimal', color: '#ffffff' },
      background: { bottomFade: { enabled: true, color: '#000000', intensity: 0.85 } },
    },
  },
  {
    name: 'Clean Cut',
    description: 'No quote mark, logo top-left, black fade',
    swatch: 'linear-gradient(160deg, #3a3a3a, #050505)',
    patch: {
      text: { fontFamily: 'Effra Heavy', fontSize: 112, uppercase: true, lineHeight: 0.98, letterSpacing: 0, align: 'center', position: 'bottom' },
      attribution: { fontFamily: 'Inter' },
      quoteMark: { enabled: false },
      logo: { position: 'top-left' },
      background: { bottomFade: { enabled: true, color: '#000000', intensity: 0.85 } },
    },
  },
];

export const LOGO_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const defaultState = {
  size: { width: 1080, height: 1350, label: 'Portrait' },

  background: {
    image: null,
    transform: { zoom: 100, x: 0, y: 0 },
    filters: { blur: 0, brightness: 100, contrast: 100, saturate: 100, grayscale: 0 },
    bottomFade: { enabled: true, color: '#000000', intensity: 0.85, texture: 'none', textureIntensity: 0.35 },
  },

  cutout: {
    image: null,
    transform: { zoom: 100, x: 0, y: 0 },
  },

  eyebrow: {
    visible: false,
    content: '',
    color: '#f5f5f5',
    italic: false,
  },

  quoteMark: {
    enabled: false,
    style: 'minimal',
    color: '#ffffff',
    badgeColor: '#ffffff',
    badgeTextColor: '#0a0a0a',
  },

  text: {
    content: 'YOUR QUOTE HERE',
    fontFamily: 'Effra Heavy',
    fontSize: 112,
    fontWeight: 400,
    color: '#ffffff',
    align: 'center',
    letterSpacing: 0,
    lineHeight: 0.98,
    uppercase: true,
    shadow: { enabled: false, blur: 10, color: 'rgba(0,0,0,0.5)' },
    position: 'bottom',
  },

  attribution: {
    content: '',
    fontFamily: 'Inter',
    fontSize: 20,
    color: '#a0a0a0',
    visible: true,
  },

  logo: {
    visible: true,
    position: 'top-left',
    size: 80,
    opacity: 0.85,
  },

  effects: {
    border: { enabled: false, width: 2, color: '#D4A017', radius: 0 },
    frame: { enabled: false, color: '#3ddc97', width: 4, inset: 4, radius: 16 },
    vignette: { enabled: false, intensity: 0.5 },
    noise: { enabled: false, intensity: 0.1 },
  },

  export: {
    format: 'png',
    quality: 0.92,
    scale: 2,
  },
};

function deepMerge(target, patch) {
  const out = { ...target };
  for (const key in patch) {
    if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      out[key] = deepMerge(target[key], patch[key]);
    } else {
      out[key] = patch[key];
    }
  }
  return out;
}

function reducer(state, action) {
  switch (action.type) {
    case 'PATCH':
      return deepMerge(state, action.payload);
    case 'SET_PATH': {
      const { path, value } = action;
      const keys = path.split('.');
      const next = { ...state };
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cursor[keys[i]] = { ...cursor[keys[i]] };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    }
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

const DesignStateContext = createContext(null);
const DesignDispatchContext = createContext(null);

export function DesignProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const setPath = useCallback((path, value) => {
    dispatch({ type: 'SET_PATH', path, value });
  }, []);

  const patch = useCallback((payload) => {
    dispatch({ type: 'PATCH', payload });
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <DesignStateContext.Provider value={state}>
      <DesignDispatchContext.Provider value={{ setPath, patch, reset }}>
        {children}
      </DesignDispatchContext.Provider>
    </DesignStateContext.Provider>
  );
}

export function useDesignState() {
  const ctx = useContext(DesignStateContext);
  if (!ctx) throw new Error('useDesignState must be used within DesignProvider');
  return ctx;
}

export function useDesignDispatch() {
  const ctx = useContext(DesignDispatchContext);
  if (!ctx) throw new Error('useDesignDispatch must be used within DesignProvider');
  return ctx;
}
