/**
 * Simulation Controller
 * Manages the simulation loop and coordinates between model and rendering
 */
class SimulationController {
  constructor() {
    this.model = null;
    this.isRunning = false;
    this.stepsPerFrame = 1;
    this.frameCallback = null;
    this.frameRate = 30; // target FPS
    this.frameInterval = 1000 / this.frameRate;
    
    this.lastFrameTime = 0;
    this.simulationTimeoutId = null;
    this.frameTimeoutId = null;
  }

  /**
   * Initialize the simulation with given parameters
   */
  initialize(size, temperature, modelType = 'ising') {
    this.model = new IsingModel(size, temperature, modelType);
    return this;
  }

  /**
   * Set callback function for frame updates
   */
  setFrameCallback(callback) {
    this.frameCallback = callback;
    return this;
  }

  /**
   * Start the simulation
   */
  start() {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    
    this.isRunning = true;
    this.runSimulationLoop();
    this.runFrameLoop();
    return this;
  }

  /**
   * Stop the simulation
   */
  stop() {
    this.isRunning = false;
    if (this.simulationTimeoutId) {
      clearTimeout(this.simulationTimeoutId);
    }
    if (this.frameTimeoutId) {
      clearTimeout(this.frameTimeoutId);
    }
    return this;
  }

  /**
   * Simulation loop - runs as fast as possible
   */
  runSimulationLoop() {
    if (!this.isRunning) return;
    
    for (let i = 0; i < this.stepsPerFrame; i++) {
      this.model.metropolisStep();
    }
    
    this.simulationTimeoutId = setTimeout(() => {
      this.runSimulationLoop();
    }, 0);
  }

  /**
   * Frame update loop - runs at target FPS
   */
  runFrameLoop() {
    if (!this.isRunning) return;
    
    const now = performance.now();
    if (now - this.lastFrameTime >= this.frameInterval) {
      if (this.frameCallback) {
        const frameData = {
          lattice: this.model.getLattice(),
          magnetization: this.model.calculateMagnetization(),
          magnetizationComponents: this.model.getMagnetizationComponents(),
          modelType: this.model.getModelType(),
          pottsStates: this.model.getPottsStates ? this.model.getPottsStates() : 3,
          timestamp: now
        };
        this.frameCallback(frameData);
      }
      this.lastFrameTime = now;
    }
    
    this.frameTimeoutId = setTimeout(() => {
      this.runFrameLoop();
    }, Math.max(0, this.frameInterval - (performance.now() - this.lastFrameTime)));
  }

  /**
   * Update simulation parameters
   */
  setTemperature(temperature) {
    if (this.model) {
      this.model.setTemperature(temperature);
    }
    return this;
  }

  setBoundary(boundaryType) {
    if (this.model) {
      this.model.setBoundary(boundaryType);
    }
    return this;
  }

  setField(field) {
    if (this.model) {
      this.model.setField(field);
    }
    return this;
  }

  setStepsPerFrame(steps) {
    this.stepsPerFrame = steps;
    return this;
  }

  setFrameRate(fps) {
    this.frameRate = fps;
    this.frameInterval = 1000 / fps;
    return this;
  }

  setModelType(modelType) {
    if (this.model) {
      this.model.setModelType(modelType);
    }
    return this;
  }

  setAlgorithm(algorithm) {
    if (this.model) {
      this.model.setAlgorithm(algorithm);
    }
    return this;
  }

  setPottsStates(states) {
    if (this.model) {
      this.model.setPottsStates(states);
    }
    return this;
  }

  /**
   * Get current model state
   */
  getModelState() {
    if (!this.model) return null;
    
    return {
      lattice: this.model.getLattice(),
      magnetization: this.model.calculateMagnetization(),
      magnetizationComponents: this.model.getMagnetizationComponents(),
      modelType: this.model.getModelType(),
      size: this.model.getSize()
    };
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimulationController;
} else if (typeof self !== 'undefined') {
  self.SimulationController = SimulationController;
}