/**
 * UI Controller for the Ising Model webapp
 * Handles user interactions and updates simulation parameters
 */
class UIController {
  constructor() {
    this.elements = {};
    this.callbacks = {};
    this.fpsTracker = new FPSTracker();
  }

  /**
   * Initialize UI elements and event listeners
   */
  initialize() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupAccordions();
    
    // Initial check for Wolff notifications
      setTimeout(() => {
      this.updateWolffNotification();
      this.updateWolffNotification2();
      this.updateWolffNotification3();
    }, 0);    return this;
  }

  /**
   * Cache DOM elements for efficient access
   */
  cacheElements() {
    const elementIds = [
      'temp', 'tempVal', 'field', 'fieldVal', 
      'speed', 'speedVal', 'resolution', 'resolutionVal','fpsVal', 'magVal', 'magXVal', 'magYVal',
      'rollingMeanVal', 'rollingStdVal', 'wolffNotification', 'wolffNotification2', 'wolffNotification3',
      'pottsStates', 'pottsStatesVal'
    ];
    
    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });
    
    this.elements.boundaryRadios = document.querySelectorAll('input[name="boundary"]');
    this.elements.modelRadios = document.querySelectorAll('input[name="model"]');
    this.elements.algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
  }

  /**
   * Setup event listeners for controls
   */
  setupEventListeners() {
    // Temperature slider
    this.elements.temp.addEventListener('input', () => {
      const temperature = parseFloat(this.elements.temp.value);
      this.elements.tempVal.textContent = temperature;
      this.triggerCallback('temperatureChange', temperature);
    });

    // Field slider
    this.elements.field.addEventListener('input', () => {
      const field = parseFloat(this.elements.field.value);
      this.elements.fieldVal.textContent = field.toFixed(2);
      this.updateWolffNotification();
      this.updateWolffNotification2();
      this.triggerCallback('fieldChange', field);
    });

    // Speed slider
    this.elements.speed.addEventListener('input', () => {
      const speed = parseInt(this.elements.speed.value);
      this.elements.speedVal.textContent = speed;
      this.triggerCallback('speedChange', speed);
    });

    // Resolution slider
    if (this.elements.resolution) {
      this.elements.resolution.addEventListener('input', () => {
        const resolution = parseInt(this.elements.resolution.value);
        this.elements.resolutionVal.textContent = resolution + '×' + resolution;
        this.triggerCallback('resolutionChange', resolution);
      });
    }

    // Potts states slider
    if (this.elements.pottsStates) {
      this.elements.pottsStates.addEventListener('input', () => {
        const states = parseInt(this.elements.pottsStates.value);
        this.elements.pottsStatesVal.textContent = states;
        this.triggerCallback('pottsStatesChange', states);
      });
    }

    // Boundary condition radios
    this.elements.boundaryRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.triggerCallback('boundaryChange', radio.value);
        }
      });
    });

    // Model type radios
    if (this.elements.modelRadios) {
      this.elements.modelRadios.forEach(radio => {
        radio.addEventListener('change', () => {
          if (radio.checked) {
            this.updateModelDisplay(radio.value);
            this.updateWolffNotification2();
            this.updateWolffNotification3();
            this.triggerCallback('modelTypeChange', radio.value);
          }
        });
      });
    }

    // Algorithm radios
    if (this.elements.algorithmRadios) {
      this.elements.algorithmRadios.forEach(radio => {
        radio.addEventListener('change', () => {
          if (radio.checked) {
            this.updateWolffNotification();
            this.updateWolffNotification2();
            this.updateWolffNotification3();
            this.triggerCallback('algorithmChange', radio.value);
          }
        });
      });
    }
  }

  /**
   * Setup accordion functionality
   */
  setupAccordions() {
    this.setupAccordion('accordionBtn', 'accordionContent', 'What is this model?');
    this.setupAccordion('accordionNumBtn', 'accordionNumContent', 'Simulation Details');
  }

  /**
   * Setup individual accordion
   */
  setupAccordion(btnId, contentId, title) {
    const btn = document.getElementById(btnId);
    const content = document.getElementById(contentId);
    
    if (btn && content) {
      btn.addEventListener('click', () => {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        btn.textContent = `${title} ${isVisible ? '▼' : '▲'}`;
      });
    }
  }

  /**
   * Register callback for UI events
   */
  on(event, callback) {
    this.callbacks[event] = callback;
    return this;
  }

  /**
   * Trigger callback if it exists
   */
  triggerCallback(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  /**
   * Update display values
   */
  updateMagnetization(value, components = null, rollingStats = null) {
    if (this.elements.magVal) {
      this.elements.magVal.textContent = value.toFixed(3);
    }
    
    // Update rolling statistics
    if (rollingStats) {
      if (this.elements.rollingMeanVal) {
        this.elements.rollingMeanVal.textContent = rollingStats.mean.toFixed(3);
      }
      if (this.elements.rollingStdVal) {
        this.elements.rollingStdVal.textContent = rollingStats.std.toFixed(3);
      }
    }
    
    // Update magnetization components for rotator model
    if (components && this.elements.magXVal && this.elements.magYVal) {
      this.elements.magXVal.textContent = components.x.toFixed(3);
      this.elements.magYVal.textContent = components.y.toFixed(3);
    }
  }

  updateFPS(fps) {
    if (this.elements.fpsVal) {
      this.elements.fpsVal.textContent = fps.toFixed(1);
    }
  }

  /**
   * Update Wolff notification visibility based on current settings
   */
  updateWolffNotification() {
    const isWolffSelected = document.querySelector('input[name="algorithm"]:checked')?.value === 'wolff';
    const fieldValue = Math.abs(parseFloat(this.elements.field?.value || 0));
    const shouldShow = isWolffSelected && fieldValue < 1e-10;
    
    if (this.elements.wolffNotification) {
      this.elements.wolffNotification.style.display = shouldShow ? 'block' : 'none';
    }
  }

  updateWolffNotification2() {
    const isWolffSelected = document.querySelector('input[name="algorithm"]:checked')?.value === 'wolff';
    const ModelTypeIsRotator = document.querySelector('input[name="model"]:checked')?.value === 'rotator';
    const shouldShow = isWolffSelected && ModelTypeIsRotator;
    
    if (this.elements.wolffNotification2) {
      this.elements.wolffNotification2.style.display = shouldShow ? 'block' : 'none';
    }
  }

  updateWolffNotification3() {
    const isWolffSelected = document.querySelector('input[name="algorithm"]:checked')?.value === 'wolff';
    const ModelTypeIsPotts = document.querySelector('input[name="model"]:checked')?.value === 'potts';
    const shouldShow = isWolffSelected && ModelTypeIsPotts;
    
    if (this.elements.wolffNotification3) {
      this.elements.wolffNotification3.style.display = shouldShow ? 'block' : 'none';
    }
  }

  /**
   * Get current control values
   */
  getCurrentValues() {
    return {
      temperature: parseFloat(this.elements.temp.value),
      field: parseFloat(this.elements.field.value),
      speed: parseInt(this.elements.speed.value),
      resolution: this.elements.resolution ? parseInt(this.elements.resolution.value) : 300,
      boundary: document.querySelector('input[name="boundary"]:checked')?.value || 'periodic',
      modelType: document.querySelector('input[name="model"]:checked')?.value || 'ising',
      algorithm: document.querySelector('input[name="algorithm"]:checked')?.value || 'metropolis',
      pottsStates: this.elements.pottsStates ? parseInt(this.elements.pottsStates.value) : 3
    };
  }

  /**
   * Update display based on model type
   */
  updateModelDisplay(modelType) {
    const rotatorDisplay = document.getElementById('rotatorMagDisplay');
    if (rotatorDisplay) {
      rotatorDisplay.style.display = modelType === 'rotator' ? 'flex' : 'none';
    }
    
    const pottsDisplay = document.getElementById('pottsControlGroup');
    if (pottsDisplay) {
      pottsDisplay.style.display = modelType === 'potts' ? 'flex' : 'none';
    }
  }

  /**
   * Set control values programmatically
   */
  setValues(values) {
    if (values.temperature !== undefined) {
      this.elements.temp.value = values.temperature;
      this.elements.tempVal.textContent = values.temperature;
    }
    
    if (values.field !== undefined) {
      this.elements.field.value = values.field;
      this.elements.fieldVal.textContent = values.field.toFixed(2);
    }
    
    if (values.speed !== undefined) {
      this.elements.speed.value = values.speed;
      this.elements.speedVal.textContent = values.speed;
    }
    
    if (values.boundary !== undefined) {
      const radio = document.querySelector(`input[name="boundary"][value="${values.boundary}"]`);
      if (radio) radio.checked = true;
    }
    
    if (values.modelType !== undefined) {
      const radio = document.querySelector(`input[name="model"][value="${values.modelType}"]`);
      if (radio) {
        radio.checked = true;
        this.updateModelDisplay(values.modelType);
      }
    }
    
    if (values.algorithm !== undefined) {
      const radio = document.querySelector(`input[name="algorithm"][value="${values.algorithm}"]`);
      if (radio) radio.checked = true;
    }
    
    if (values.pottsStates !== undefined && this.elements.pottsStates) {
      this.elements.pottsStates.value = values.pottsStates;
      this.elements.pottsStatesVal.textContent = values.pottsStates;
    }
  }
}

/**
 * Simple FPS tracker utility
 */
class FPSTracker {
  constructor(sampleSize = 60) {
    this.sampleSize = sampleSize;
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
  }

  /**
   * Record a frame and return current FPS
   */
  recordFrame() {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }
    
    this.lastFrameTime = now;
    
    // Calculate average FPS
    if (this.frameTimes.length > 0) {
      const avgDelta = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      return 1000 / avgDelta;
    }
    
    return 0;
  }

  /**
   * Reset the tracker
   */
  reset() {
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
  }
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.UIController = UIController;
  window.FPSTracker = FPSTracker;
}