# Potts Model Addition to Ising Webapp

## Overview

The Potts model has been successfully added to the existing Ising model webapp. The Potts model is a generalization of the Ising model where instead of binary spins (±1), each lattice site can be in one of q discrete states (0, 1, 2, ..., q-1).

## Key Features

### 1. Potts Model Physics
- **Energy Function**: H = -J Σ δ(si, sj) - h Σ δ(si, 0)
- **States**: Each site can be in q states (2 ≤ q ≤ 8)
- **Order Parameter**: Measures deviation from random distribution of state 0
- **Phase Transitions**: First-order transitions for q ≥ 3

### 2. Implementation Details

#### Core Model (`IsingModel.js`)
- Added Potts model support to constructor with `q` parameter
- Implemented `pottsMetropolisStep()` method
- Added `calculatePottsEnergyChange()` for energy calculations  
- Updated magnetization calculation for Potts order parameter
- Added `setPottsStates()` and `getPottsStates()` methods

#### Visualization (`IsingRenderer.js`)
- Added `renderPottsLattice()` method
- Color mapping: states mapped to HSL hue space (state/q × 360°)
- Each state gets a distinct color for easy identification

#### User Interface (`UIController.js`)
- Added Potts states slider (2-8 states)
- Added Wolff algorithm warning for Potts model
- Updated model display logic to show/hide Potts controls

### 3. Visual Representation

#### Color Scheme
- **State 0**: Red-Orange (0°)
- **State 1**: Yellow (120°/q) 
- **State 2**: Green (240°/q)
- **Higher states**: Evenly distributed around color wheel

#### Order Parameter
- **+1**: All sites in state 0 (perfect order)
- **0**: Random distribution
- **-1**: State 0 completely absent

### 4. Physical Insights

#### Critical Behavior
- For q = 2: Equivalent to Ising model (second-order transition)
- For q ≥ 3: First-order phase transition
- Critical temperature: Tc = J/[kB ln(1 + √q)]

#### Algorithm Limitations
- **Wolff Cluster Algorithm**: Not implemented for Potts model
  - Reason: No unique "opposite" state for q > 2
  - Complex probability calculations required
- **Metropolis Algorithm**: Works well for all q values

### 5. Files Modified

1. **Core Physics**:
   - `js/IsingModel.js`: Added Potts model physics and simulation
   - `js/SimulationController.js`: Added Potts states parameter handling

2. **Visualization**:
   - `js/IsingRenderer.js`: Added Potts lattice rendering
   - `js/UIController.js`: Added Potts-specific UI controls

3. **Integration**:
   - `js/app.js`: Added Potts states change handling
   - `js/worker.js`: Added worker message for Potts states

4. **User Interface**:
   - `index-new.html`: Updated with Potts model controls and documentation
   - `potts-demo.html`: Created dedicated Potts model demo page

### 6. Usage Instructions

1. **Access**: Open `index-new.html` or `potts-demo.html`
2. **Select Model**: Choose "Potts" from the model radio buttons
3. **Adjust States**: Use the "States q" slider (2-8 states)
4. **Observe**: Watch phase transitions as you change temperature
5. **Experiment**: Try different field values and boundary conditions

### 7. Mathematical Background

The Potts model Hamiltonian:
```
H = -J Σ⟨i,j⟩ δ(si, sj) - h Σi δ(si, 0)
```

Where:
- J: Interaction strength (positive for ferromagnetic)
- δ(si, sj): Kronecker delta (1 if states equal, 0 otherwise)
- h: External field favoring state 0
- ⟨i,j⟩: Sum over nearest neighbor pairs

The order parameter for q states:
```
M = (n₀ - N/q) / (N - N/q)
```

Where:
- n₀: Number of sites in state 0
- N: Total number of sites
- q: Number of possible states

This implementation provides a complete, interactive simulation of the Potts model with proper physics, visualization, and educational value.