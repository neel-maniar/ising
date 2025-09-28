/**
 * Core Ising Model simulation class
 * Handles the physics simulation and lattice operations
 */
class IsingModel {
  constructor(size = 300, temperature = 2.5) {
    this.L = size;
    this.beta = 1 / temperature;
    this.lattice = new Int8Array(this.L * this.L);
    this.boundary = "periodic";
    this.field = 0; // external magnetic field h
    this.indices = new Array(this.L * this.L);
    
    this.initializeLattice();
    this.createIndices();
  }

  /**
   * Initialize lattice with random spins
   */
  initializeLattice() {
    for (let i = 0; i < this.L * this.L; i++) {
      this.lattice[i] = Math.random() < 0.5 ? 1 : -1;
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
      if (i < 0 || i >= this.L || j < 0 || j >= this.L) return 1;
      return this.lattice[i * this.L + j];
    } else if (this.boundary === "fixedDown") {
      if (i < 0 || i >= this.L || j < 0 || j >= this.L) return -1;
      return this.lattice[i * this.L + j];
    }
  }

  /**
   * Perform one Metropolis step
   */
  metropolisStep() {
    this.shuffleIndices();
    
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
   * Calculate magnetization
   */
  calculateMagnetization() {
    let sum = 0;
    for (let i = 0; i < this.lattice.length; i++) {
      sum += this.lattice[i];
    }
    return sum / this.lattice.length;
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
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IsingModel;
} else if (typeof self !== 'undefined') {
  self.IsingModel = IsingModel;
}