/**
 * Rendering utilities for the Ising model visualization
 */
class IsingRenderer {
  constructor(canvasId, scale = 1) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scale = scale;
    this.size = 0;
    
    // Create temp canvas for efficient rendering
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d');
    this.imageData = null;
  }

  /**
   * Initialize renderer with lattice size
   */
  initialize(size) {
    this.size = size;
    this.canvas.width = size * this.scale;
    this.canvas.height = size * this.scale;
    
    this.tempCanvas.width = size;
    this.tempCanvas.height = size;
    this.imageData = this.tempCtx.createImageData(size, size);
    
    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    
    return this;
  }

  /**
   * Render the lattice to canvas
   */
  renderLattice(lattice, modelType = 'ising') {
    if (!this.imageData || !lattice) return;

    if (modelType === 'ising') {
      this.renderIsingLattice(lattice);
    } else if (modelType === 'rotator') {
      this.renderRotatorLattice(lattice);
    }
  }

  /**
   * Render Ising model lattice (binary spins)
   */
  renderIsingLattice(lattice) {
    const data = this.imageData.data;
    
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const idx = (i * this.size + j) * 4;
        const spin = lattice[i * this.size + j];
        const color = spin > 0 ? 255 : 0;
        
        data[idx] = color;     // R
        data[idx + 1] = color; // G
        data[idx + 2] = color; // B
        data[idx + 3] = 255;   // A
      }
    }
    
    // Draw to temp canvas then scale to main canvas
    this.tempCtx.putImageData(this.imageData, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render rotator model lattice (continuous angles as colors)
   */
  renderRotatorLattice(lattice) {
    const data = this.imageData.data;
    
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const idx = (i * this.size + j) * 4;
        const angle = lattice[i * this.size + j];
        
        // Convert angle to HSL color (hue = angle, full saturation and lightness)
        const hue = (angle / (2 * Math.PI)) * 360;
        const rgb = this.hslToRgb(hue, 100, 50);
        
        data[idx] = rgb.r;     // R
        data[idx + 1] = rgb.g; // G
        data[idx + 2] = rgb.b; // B
        data[idx + 3] = 255;   // A
      }
    }
    
    // Draw to temp canvas then scale to main canvas
    this.tempCtx.putImageData(this.imageData, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Convert HSL to RGB
   */
  hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Get canvas element
   */
  getCanvas() {
    return this.canvas;
  }
}

/**
 * Graph renderer for magnetization over time
 */
class MagnetizationGraph {
  constructor(canvasId, maxPoints = 400) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.maxPoints = maxPoints;
    this.history = [];
    
    this.lineColor = '#ff0000';
    this.lineWidth = 1;
    this.backgroundColor = '#ffffff';
  }

  /**
   * Add a magnetization value to the history
   */
  addPoint(magnetization) {
    this.history.push(magnetization);
    if (this.history.length > this.maxPoints) {
      this.history.shift();
    }
  }

  /**
   * Render the magnetization graph
   */
  render() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear canvas
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);
    
    if (this.history.length < 2) return;
    
    // Draw center line (M = 0)
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
    
    // Draw magnetization line
    this.ctx.strokeStyle = this.lineColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.beginPath();
    
    const xStep = width / (this.maxPoints - 1);
    const startX = Math.max(0, width - this.history.length * xStep);
    
    for (let i = 0; i < this.history.length; i++) {
      const x = startX + i * xStep;
      const y = height / 2 - this.history[i] * (height / 2);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
  }

  /**
   * Clear the graph history
   */
  clear() {
    this.history = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Set styling options
   */
  setStyle(options = {}) {
    if (options.lineColor) this.lineColor = options.lineColor;
    if (options.lineWidth) this.lineWidth = options.lineWidth;
    if (options.backgroundColor) this.backgroundColor = options.backgroundColor;
    return this;
  }
}

// Export for browser environment
if (typeof window !== 'undefined') {
  window.IsingRenderer = IsingRenderer;
  window.MagnetizationGraph = MagnetizationGraph;
}