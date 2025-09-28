/**
 * Core Ising Model simulation class
 * Handles the physics simulation and lattice operations
 */
class IsingModel {
  constructor(size = 300, temperature = 2.5, modelType = 'ising') {
    this.L = size;
    this.beta = 1 / temperature;
    this.modelType = modelType; // 'ising' or 'rotator'
    this.boundary = "periodic";
    this.field = 0; // external magnetic field h
    this.indices = new Array(this.L * this.L);
    
    // Initialize lattice based on model type
    if (this.modelType === 'ising') {
      this.lattice = new Int8Array(this.L * this.L);
    } else if (this.modelType === 'rotator') {
      this.lattice = new Float32Array(this.L * this.L); // Store angles in radians
    }
    
    this.initializeLattice();
    this.createIndices();
  }

  /**
   * Initialize lattice with random spins/angles
   */
  initializeLattice() {
    if (this.modelType === 'ising') {
      for (let i = 0; i < this.L * this.L; i++) {
        this.lattice[i] = Math.random() < 0.5 ? 1 : -1;
      }
    } else if (this.modelType === 'rotator') {
      for (let i = 0; i < this.L * this.L; i++) {
        this.lattice[i] = Math.random() * 2 * Math.PI; // Random angle [0, 2π]
      }
    }
  }

  /**
   * Create shuffled indices for random sequential updates
   */
  createIndices() {
    for (let i = 0; i < this.L * this.L; i++) {
      this.indices[i] = i;
    }
  }

  /**
   * Fisher-Yates shuffle for random updates
   */
  shuffleIndices() {
    for (let i = this.indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.indices[i], this.indices[j]] = [this.indices[j], this.indices[i]];
    }
  }

  /**
   * Get spin value with boundary conditions
   */
  getSpin(i, j) {
    if (this.boundary === "periodic") {
      return this.lattice[((i + this.L) % this.L) * this.L + ((j + this.L) % this.L)];
    } else if (this.boundary === "fixedUp") {
      if (i < 0 || i >= this.L || j < 0 || j >= this.L) {
        return this.modelType === 'ising' ? 1 : 0; // 0 radians = pointing up
      }
      return this.lattice[i * this.L + j];
    } else if (this.boundary === "fixedDown") {
      if (i < 0 || i >= this.L || j < 0 || j >= this.L) {
        return this.modelType === 'ising' ? -1 : Math.PI; // π radians = pointing down
      }
      return this.lattice[i * this.L + j];
    }
  }

  /**
   * Perform one Metropolis step
   */
  metropolisStep() {
    this.shuffleIndices();
    
    if (this.modelType === 'ising') {
      this.isingMetropolisStep();
    } else if (this.modelType === 'rotator') {
      this.rotatorMetropolisStep();
    }
  }

  /**
   * Metropolis step for Ising model
   */
  isingMetropolisStep() {
    for (let k = 0; k < this.indices.length; k++) {
      const idx = this.indices[k];
      const i = Math.floor(idx / this.L);
      const j = idx % this.L;
      const s = this.lattice[idx];
      
      // Calculate neighbor sum
      const nb = this.getSpin(i + 1, j) + 
                 this.getSpin(i - 1, j) + 
                 this.getSpin(i, j + 1) + 
                 this.getSpin(i, j - 1);
      
      // Energy change for flipping this spin
      const dE = 2 * s * (nb + this.field);
      
      // Metropolis criterion
      if (dE <= 0 || Math.random() < Math.exp(-this.beta * dE)) {
        this.lattice[idx] = -s;
      }
    }
  }

  /**
   * Metropolis step for rotator model (XY model)
   */
  rotatorMetropolisStep() {
    const maxAngleChange = 0.5; // Maximum angle change per step
    
    for (let k = 0; k < this.indices.length; k++) {
      const idx = this.indices[k];
      const i = Math.floor(idx / this.L);
      const j = idx % this.L;
      const currentAngle = this.lattice[idx];
      
      // Propose new angle
      const deltaAngle = (Math.random() - 0.5) * 2 * maxAngleChange;
      const newAngle = (currentAngle + deltaAngle + 2 * Math.PI) % (2 * Math.PI);
      
      // Calculate energy change
      const dE = this.calculateRotatorEnergyChange(i, j, currentAngle, newAngle);
      
      // Metropolis criterion
      if (dE <= 0 || Math.random() < Math.exp(-this.beta * dE)) {
        this.lattice[idx] = newAngle;
      }
    }
  }

  /**
   * Calculate energy change for rotator model
   */
  calculateRotatorEnergyChange(i, j, oldAngle, newAngle) {
    const neighbors = [
      this.getSpin(i + 1, j),
      this.getSpin(i - 1, j),
      this.getSpin(i, j + 1),
      this.getSpin(i, j - 1)
    ];
    
    let oldEnergy = 0;
    let newEnergy = 0;
    
    for (const neighborAngle of neighbors) {
      // Energy = -J * cos(θ_i - θ_j) for each neighbor pair
      oldEnergy -= Math.cos(oldAngle - neighborAngle);
      newEnergy -= Math.cos(newAngle - neighborAngle);
    }
    
    // Add field contribution: -h * cos(θ)
    oldEnergy -= this.field * Math.cos(oldAngle);
    newEnergy -= this.field * Math.cos(newAngle);
    
    return newEnergy - oldEnergy;
  }

  /**
   * Calculate magnetization
   */
  calculateMagnetization() {
    if (this.modelType === 'ising') {
      let sum = 0;
      for (let i = 0; i < this.lattice.length; i++) {
        sum += this.lattice[i];
      }
      return sum / this.lattice.length;
    } else if (this.modelType === 'rotator') {
      // For rotator model, calculate vector magnetization
      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < this.lattice.length; i++) {
        sumX += Math.cos(this.lattice[i]);
        sumY += Math.sin(this.lattice[i]);
      }
      // Return magnitude of average magnetization vector
      const avgX = sumX / this.lattice.length;
      const avgY = sumY / this.lattice.length;
      return Math.sqrt(avgX * avgX + avgY * avgY);
    }
  }

  /**
   * Get magnetization components for rotator model
   */
  getMagnetizationComponents() {
    if (this.modelType !== 'rotator') return { x: 0, y: 0, magnitude: this.calculateMagnetization() };
    
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < this.lattice.length; i++) {
      sumX += Math.cos(this.lattice[i]);
      sumY += Math.sin(this.lattice[i]);
    }
    const avgX = sumX / this.lattice.length;
    const avgY = sumY / this.lattice.length;
    return {
      x: avgX,
      y: avgY,
      magnitude: Math.sqrt(avgX * avgX + avgY * avgY)
    };
  }

  /**
   * Update simulation parameters
   */
  setTemperature(temperature) {
    this.beta = 1 / temperature;
  }

  setBoundary(boundaryType) {
    this.boundary = boundaryType;
  }

  setField(field) {
    this.field = field;
  }

  getLattice() {
    return this.lattice;
  }

  getSize() {
    return this.L;
  }

  getModelType() {
    return this.modelType;
  }

  setModelType(modelType) {
    if (modelType !== this.modelType) {
      this.modelType = modelType;
      // Reinitialize lattice for new model type
      if (this.modelType === 'ising') {
        this.lattice = new Int8Array(this.L * this.L);
      } else if (this.modelType === 'rotator') {
        this.lattice = new Float32Array(this.L * this.L);
      }
      this.initializeLattice();
    }
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IsingModel;
} else if (typeof self !== 'undefined') {
  self.IsingModel = IsingModel;
}