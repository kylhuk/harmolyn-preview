import { useState, useEffect, useCallback } from 'react';

/**
 * Performance mode: disables expensive visual effects (backdrop-blur, glows, 
 * complex shadows, animations) for low-end devices.
 * 
 * Auto-detects via:
 * - prefers-reduced-motion media query
 * - navigator.deviceMemory (< 4GB → low-end)
 * - navigator.hardwareConcurrency (< 4 cores → low-end)
 * 
 * Adds/removes `.perf-mode` class on <html> element.
 * All expensive CSS effects are neutralized via that single class.
 */

const STORAGE_KEY = 'harmolyn-perf-mode';

function detectLowEnd(): boolean {
  // Respect OS-level reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  const nav = typeof navigator !== 'undefined' ? navigator : null;
  if (!nav) return false;

  // Device memory API (Chrome/Edge) — values in GB
  if ('deviceMemory' in nav && (nav as any).deviceMemory < 4) {
    return true;
  }

  // Low core count
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) {
    return true;
  }

  return false;
}

export function usePerformanceMode() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return detectLowEnd();
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('perf-mode');
    } else {
      root.classList.remove('perf-mode');
    }
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = useCallback(() => setEnabled(prev => !prev), []);

  return { perfMode: enabled, setPerfMode: setEnabled, togglePerfMode: toggle };
}
