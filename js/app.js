/**
 * Main Application Class
 * Coordinates all components of the Ising Model webapp
 */
class IsingApp {
  constructor() {
    this.config = {
      latticeSize: 300,
      initialTemperature: 2.5,
      canvasScale: 1,
      targetFPS: 30
    };
    
    this.ui = null;
    this.renderer = null;
    this.graph = null;
    this.worker = null;
    this.fpsTracker = new FPSTracker();
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      await this.initializeComponents();
      this.setupWorker();
      this.bindEvents();
      this.start();
      
      console.log('Ising Model App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  /**
   * Initialize UI components
   */
  async initializeComponents() {
    // Initialize UI controller
    this.ui = new UIController();
    this.ui.initialize();
    
    // Initialize renderer
    this.renderer = new IsingRenderer('canvas', this.config.canvasScale);
    this.renderer.initialize(this.config.latticeSize);
    
    // Initialize magnetization graph
    this.graph = new MagnetizationGraph('graphCanvas');
    this.graph.setStyle({
      lineColor: '#ff0000',
      lineWidth: 1,
      backgroundColor: '#ffffff'
    });
  }

  /**
   * Setup web worker
   */
  setupWorker() {
    this.worker = new Worker('js/worker.js');
    
    this.worker.onmessage = (e) => {
      this.handleWorkerMessage(e);
    };
    
    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
    };
    
    // Initialize worker with config
    this.worker.postMessage({
      type: 'init',
      data: {
        size: this.config.latticeSize,
        temperature: this.config.initialTemperature,
        modelType: 'ising' // Default to Ising model
      }
    });
  }

  /**
   * Handle messages from web worker
   */
  handleWorkerMessage(e) {
    const { type, data } = e.data;
    
    switch (type) {
      case 'initialized':
        console.log('Worker initialized');
        break;
        
      case 'frame':
        this.handleFrameUpdate(data);
        break;
        
      case 'started':
        console.log('Simulation started');
        break;
        
      case 'stopped':
        console.log('Simulation stopped');
        break;
        
      default:
        console.warn('Unknown worker message type:', type);
    }
  }

  /**
   * Handle frame updates from worker
   */
  handleFrameUpdate(frameData) {
    // Render lattice with model type information
    this.renderer.renderLattice(frameData.lattice, frameData.modelType);
    
    // Update magnetization graph
    this.graph.addPoint(frameData.magnetization);
    this.graph.render();
    
    // Get rolling statistics from graph
    const rollingStats = this.graph.getCurrentStats();
    
    // Update UI displays
    this.ui.updateMagnetization(frameData.magnetization, frameData.magnetizationComponents, rollingStats);
    
    // Update FPS
    const fps = this.fpsTracker.recordFrame();
    this.ui.updateFPS(fps);
  }

  /**
   * Bind UI events to worker messages
   */
  bindEvents() {
    this.ui
      .on('temperatureChange', (temperature) => {
        this.worker.postMessage({
          type: 'setTemperature',
          data: { temperature }
        });
      })
      .on('fieldChange', (field) => {
        this.worker.postMessage({
          type: 'setField',
          data: { field }
        });
      })
      .on('speedChange', (steps) => {
        this.worker.postMessage({
          type: 'setStepsPerFrame',
          data: { steps }
        });
      })
      .on('boundaryChange', (boundary) => {
        this.worker.postMessage({
          type: 'setBoundary',
          data: { boundary }
        });
      })
      .on('modelTypeChange', (modelType) => {
        this.worker.postMessage({
          type: 'setModelType',
          data: { modelType }
        });
        
        // Clear the graph when changing model types
        this.graph.clear();
      })
      .on('algorithmChange', (algorithm) => {
        this.worker.postMessage({
          type: 'setAlgorithm',
          data: { algorithm }
        });
      });
  }

  /**
   * Start the simulation
   */
  start() {
    this.worker.postMessage({ type: 'start' });
  }

  /**
   * Stop the simulation
   */
  stop() {
    this.worker.postMessage({ type: 'stop' });
  }

  /**
   * Reset the simulation
   */
  reset() {
    this.stop();
    this.graph.clear();
    this.renderer.clear();
    this.fpsTracker.reset();
    
    // Reinitialize worker
    setTimeout(() => {
      this.worker.postMessage({
        type: 'init',
        data: {
          size: this.config.latticeSize,
          temperature: this.ui.getCurrentValues().temperature
        }
      });
    }, 100);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.worker) {
      this.stop();
      this.worker.terminate();
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new IsingApp();
  
  // Make app globally accessible for debugging
  window.isingApp = app;
  
  // Initialize the app
  app.initialize().catch(error => {
    console.error('Failed to start Ising Model App:', error);
    alert('Failed to initialize the simulation. Please refresh the page.');
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.destroy();
  });
});