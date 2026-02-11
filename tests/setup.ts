/**
 * VeloxGrid Test Setup
 * @description jsdom 환경 보완 및 공통 유틸리티
 */

// jsdom에 누락된 API 보완
if (typeof window.CSS === 'undefined') {
  (window as any).CSS = { supports: () => false };
}

// requestAnimationFrame polyfill
if (typeof window.requestAnimationFrame === 'undefined') {
  (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
  (window as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
}

// ResizeObserver mock
if (typeof window.ResizeObserver === 'undefined') {
  (window as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
