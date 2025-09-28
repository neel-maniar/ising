/**
 * Web Worker for Ising Model simulation
 * Runs the simulation in a separate thread to avoid blocking the UI
 */

// Import the required classes
importScripts('IsingModel.js', 'SimulationController.js');

class IsingWorker {
  constructor() {
    this.controller = new SimulationController();
    this.isInitialized = false;
  }

  /**
   * Handle messages from the main thread
   */
  handleMessage(e) {
    const { type, data } = e.data;
    
    switch (type) {
      case 'init':
        this.initialize(data);
        break;
      case 'start':
        this.start();
        break;
      case 'stop':
        this.stop();
        break;
      case 'setTemperature':
        this.controller.setTemperature(data.temperature);
        break;
      case 'setField':
        this.controller.setField(data.field);
        break;
      case 'setBoundary':
        this.controller.setBoundary(data.boundary);
        break;
      case 'setStepsPerFrame':
        this.controller.setStepsPerFrame(data.steps);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * Initialize the simulation
   */
  initialize(params) {
    const { size = 300, temperature = 2.5 } = params;
    
    this.controller
      .initialize(size, temperature)
      .setFrameCallback((frameData) => {
        // Send frame data back to main thread
        this.postMessage({
          type: 'frame',
          data: {
            lattice: frameData.lattice,
            magnetization: frameData.magnetization,
            timestamp: frameData.timestamp
          }
        });
      });
    
    this.isInitialized = true;
    this.postMessage({ type: 'initialized' });
  }

  /**
   * Start the simulation
   */
  start() {
    if (!this.isInitialized) {
      console.warn('Worker not initialized');
      return;
    }
    
    this.controller.start();
    this.postMessage({ type: 'started' });
  }

  /**
   * Stop the simulation
   */
  stop() {
    this.controller.stop();
    this.postMessage({ type: 'stopped' });
  }

  /**
   * Send message to main thread
   */
  postMessage(message) {
    self.postMessage(message);
  }
}

// Create worker instance and set up message handler
const worker = new IsingWorker();

self.onmessage = function(e) {
  worker.handleMessage(e);
};