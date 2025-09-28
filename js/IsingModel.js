/**
 * Core Ising Model simulation class
 * Handles the physics simulation and lattice operations
 */
class IsingModel {
  constructor(size = 300, temperature = 2.5, modelType = 'ising') {
    this.L = size;
    this.beta = 1 / temperature;
    this.modelType = modelType; // 'ising', 'rotator', or 'potts'
    this.algorithm = 'metropolis'; // 'metropolis' or 'wolff'
    this.boundary = "periodic";
    this.field = 0; // external magnetic field h
    this.q = 3; // number of states for Potts model
    this.indices = new Array(this.L * this.L);
    
    // Initialize lattice based on model type
    if (this.modelType === 'ising') {
      this.lattice = new Int8Array(this.L * this.L);
    } else if (this.modelType === 'rotator') {
      this.lattice = new Float32Array(this.L * this.L); // Store angles in radians
    } else if (this.modelType === 'potts') {
      this.lattice = new Int8Array(this.L * this.L); // Store state indices 0, 1, ..., q-1
    }
    
    this.initializeLattice();
    this.createIndices();
  }

  /**
   * Initialize lattice with random spins/angles/states
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
    } else if (this.modelType === 'potts') {
      for (let i = 0; i < this.L * this.L; i++) {
        this.lattice[i] = Math.floor(Math.random() * this.q); // Random state [0, q-1]
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
        if (this.modelType === 'ising') return 1;
        else if (this.modelType === 'rotator') return 0; // 0 radians = pointing up
        else if (this.modelType === 'potts') return 0; // state 0
      }
      return this.lattice[i * this.L + j];
    } else if (this.boundary === "fixedDown") {
      if (i < 0 || i >= this.L || j < 0 || j >= this.L) {
        if (this.modelType === 'ising') return -1;
        else if (this.modelType === 'rotator') return Math.PI; // π radians = pointing down
        else if (this.modelType === 'potts') return this.q - 1; // highest state
      }
      return this.lattice[i * this.L + j];
    }
  }

  /**
   * Perform one Monte Carlo step using selected algorithm
   */
  metropolisStep() {
    if (this.algorithm === 'wolff' && this.modelType === 'ising' && Math.abs(this.field) > 1e-10) {
      this.wolffStep();
    } else {
      this.shuffleIndices();
      
      if (this.modelType === 'ising') {
        this.isingMetropolisStep();
      } else if (this.modelType === 'rotator') {
        this.rotatorMetropolisStep();
      } else if (this.modelType === 'potts') {
        this.pottsMetropolisStep();
      }
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
   * Metropolis step for Potts model
   */
  pottsMetropolisStep() {
    for (let k = 0; k < this.indices.length; k++) {
      const idx = this.indices[k];
      const i = Math.floor(idx / this.L);
      const j = idx % this.L;
      const currentState = this.lattice[idx];
      
      // Propose new state (different from current)
      let newState;
      do {
        newState = Math.floor(Math.random() * this.q);
      } while (newState === currentState);
      
      // Calculate energy change
      const dE = this.calculatePottsEnergyChange(i, j, currentState, newState);
      
      // Metropolis criterion
      if (dE <= 0 || Math.random() < Math.exp(-this.beta * dE)) {
        this.lattice[idx] = newState;
      }
    }
  }

  /**
   * Calculate energy change for Potts model
   */
  calculatePottsEnergyChange(i, j, oldState, newState) {
    const neighbors = [
      this.getSpin(i + 1, j),
      this.getSpin(i - 1, j),
      this.getSpin(i, j + 1),
      this.getSpin(i, j - 1)
    ];
    
    let oldEnergy = 0;
    let newEnergy = 0;
    
    for (const neighborState of neighbors) {
      // Energy = -J * δ(s_i, s_j) for each neighbor pair (Kronecker delta)
      oldEnergy -= (oldState === neighborState) ? 1 : 0;
      newEnergy -= (newState === neighborState) ? 1 : 0;
    }
    
    // Add field contribution: -h * δ(s_i, 0) (field favors state 0)
    oldEnergy -= this.field * ((oldState === 0) ? 1 : 0);
    newEnergy -= this.field * ((newState === 0) ? 1 : 0);
    
    return newEnergy - oldEnergy;
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
   * Wolff cluster algorithm for Ising model
   */
  wolffStep() {
    // Only works for Ising model with non-zero field
    if (this.modelType !== 'ising' || Math.abs(this.field) < 1e-10) return;
    
    // Probability of adding a neighbor to cluster
    const pAdd = 1 - Math.exp(-2 * this.beta);
    
    // Choose random starting site
    const startIdx = Math.floor(Math.random() * (this.L * this.L));
    const startSpin = this.lattice[startIdx];
    
    // Build cluster using breadth-first search
    const cluster = new Set();
    const stack = [startIdx];
    cluster.add(startIdx);
    
    while (stack.length > 0) {
      const currentIdx = stack.pop();
      const i = Math.floor(currentIdx / this.L);
      const j = currentIdx % this.L;
      
      // Check all neighbors
      const neighbors = [
        { i: i + 1, j: j },
        { i: i - 1, j: j },
        { i: i, j: j + 1 },
        { i: i, j: j - 1 }
      ];
      
      for (const neighbor of neighbors) {
        const neighborIdx = this.getNeighborIndex(neighbor.i, neighbor.j);
        
        // Skip if neighbor is already in cluster or out of bounds
        if (neighborIdx === -1 || cluster.has(neighborIdx)) continue;
        
        // Add to cluster if same spin and probability test passes
        if (this.lattice[neighborIdx] === startSpin && Math.random() < pAdd) {
          cluster.add(neighborIdx);
          stack.push(neighborIdx);
        }
      }
    }
    
    // Calculate energy change for cluster flip due to external field
    let energyChange = 0;
    for (const idx of cluster) {
      energyChange += 2 * this.lattice[idx] * this.field;
    }
    
    // Accept cluster flip with Metropolis criterion
    if (energyChange <= 0 || Math.random() < Math.exp(-this.beta * energyChange)) {
      // Flip entire cluster
      for (const idx of cluster) {
        this.lattice[idx] *= -1;
      }
    }
  }

  /**
   * Get neighbor index with boundary conditions
   */
  getNeighborIndex(i, j) {
    if (this.boundary === "periodic") {
      const wrappedI = ((i + this.L) % this.L);
      const wrappedJ = ((j + this.L) % this.L);
      return wrappedI * this.L + wrappedJ;
    } else if (this.boundary === "fixedUp" || this.boundary === "fixedDown") {
      if (i < 0 || i >= this.L || j < 0 || j >= this.L) {
        return -1; // Out of bounds
      }
      return i * this.L + j;
    }
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
    } else if (this.modelType === 'potts') {
      // For Potts model, calculate order parameter based on state 0 concentration
      let count0 = 0;
      for (let i = 0; i < this.lattice.length; i++) {
        if (this.lattice[i] === 0) count0++;
      }
      // Return deviation from random distribution: M = (n_0 - N/q) / (N - N/q)
      const expected = this.lattice.length / this.q;
      const maxDeviation = this.lattice.length - expected;
      return (count0 - expected) / maxDeviation;
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

  setAlgorithm(algorithm) {
    this.algorithm = algorithm;
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
      } else if (this.modelType === 'potts') {
        this.lattice = new Int8Array(this.L * this.L);
      }
      this.initializeLattice();
    }
  }

  /**
   * Set number of states for Potts model
   */
  setPottsStates(q) {
    this.q = Math.max(2, Math.min(10, q)); // Limit between 2 and 10 states
    if (this.modelType === 'potts') {
      this.initializeLattice(); // Reinitialize with new number of states
    }
  }

  /**
   * Get number of states for Potts model
   */
  getPottsStates() {
    return this.q;
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IsingModel;
} else if (typeof self !== 'undefined') {
  self.IsingModel = IsingModel;
}