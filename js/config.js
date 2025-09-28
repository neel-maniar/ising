/**
 * Configuration file for the Ising Model application
 * Centralized settings for easy customization
 */

const AppConfig = {
  // Simulation parameters
  simulation: {
    defaultLatticeSize: 300,
    defaultTemperature: 2.5,
    defaultField: 0.0,
    defaultBoundary: 'periodic',
    defaultStepsPerFrame: 1,
    maxStepsPerFrame: 30,
    targetFPS: 30
  },

  // Rendering settings
  rendering: {
    canvasScale: 1,
    pixelated: true,
    backgroundColor: '#ffffff',
    spinUpColor: '#ffffff',
    spinDownColor: '#000000'
  },

  // Graph settings
  graph: {
    maxPoints: 400,
    lineColor: '#ff0000',
    lineWidth: 1,
    backgroundColor: '#ffffff',
    showGrid: false,
    showAxes: true
  },

  // UI settings
  ui: {
    accordionAnimationDuration: 300,
    sliderUpdateThrottle: 50,
    fpsUpdateInterval: 100,
    tooltips: true
  },

  // Performance settings
  performance: {
    workerEnabled: true,
    maxFrameSkip: 5,
    adaptiveFrameRate: false,
    lowPowerMode: false
  },

  // Debug settings
  debug: {
    enabled: false,
    showFPS: true,
    logWorkerMessages: false,
    showPerformanceMetrics: false
  }
};

// Make config globally available
if (typeof window !== 'undefined') {
  window.AppConfig = AppConfig;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}