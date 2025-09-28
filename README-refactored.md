# Ising Model Simulator - Refactored

This is a refactored version of the Ising Model webapp with improved scalability and maintainability.

## Architecture Overview

The application has been restructured into a modular architecture with clear separation of concerns:

### Core Components

1. **IsingModel.js** - Core physics simulation logic
   - Handles lattice operations and Metropolis algorithm
   - Pure simulation logic without UI dependencies
   - Configurable boundary conditions and parameters

2. **SimulationController.js** - Simulation lifecycle management
   - Manages simulation loop and timing
   - Coordinates between model and rendering
   - Handles frame rate control and background processing

3. **IsingRenderer.js** - Visualization and rendering
   - Canvas-based lattice rendering with efficient pixel manipulation
   - Magnetization graph with real-time updates
   - Responsive and optimized rendering pipeline

4. **UIController.js** - User interface management
   - Handles all user interactions and control updates
   - Event-driven architecture with callback system
   - FPS tracking and display management

5. **worker.js** - Web Worker implementation
   - Runs simulation in separate thread to prevent UI blocking
   - Message-based communication with main thread
   - Improved performance for intensive calculations

6. **app.js** - Main application coordinator
   - Orchestrates all components
   - Handles initialization and cleanup
   - Global error handling and debugging support

### File Structure

```
├── index-new.html          # Updated HTML with modular structure
├── css/
│   └── styles.css          # Modern, responsive CSS
├── js/
│   ├── IsingModel.js       # Core simulation logic
│   ├── SimulationController.js  # Simulation management
│   ├── IsingRenderer.js    # Rendering components
│   ├── UIController.js     # UI interaction handling
│   ├── worker.js          # Web Worker implementation
│   └── app.js             # Main application
├── package.json           # Project configuration
└── README-refactored.md   # This file
```

## Key Improvements

### 1. **Modular Architecture**
- Separated concerns into distinct, reusable modules
- Each class has a single responsibility
- Easy to test, maintain, and extend

### 2. **Performance Optimization**
- Web Worker prevents UI blocking during intensive calculations
- Efficient canvas rendering with image data manipulation
- Configurable frame rates and update frequencies

### 3. **Better User Experience**
- Responsive design that works on mobile devices
- Modern CSS with smooth animations and transitions
- Improved visual feedback and controls

### 4. **Code Quality**
- Consistent coding style and documentation
- Error handling and debugging support
- Event-driven architecture for loose coupling

### 5. **Extensibility**
- Easy to add new visualization modes
- Configurable simulation parameters
- Plugin-ready architecture for additional features

## Usage

### Development Server
```bash
# Using Python 3
npm run serve

# Or using Python 2
npm run serve-alt

# Or directly
python3 -m http.server 8000
```

Then open http://localhost:8000/index-new.html in your browser.

### Customization

#### Adding New Parameters
1. Add parameter to `IsingModel.js`
2. Add UI control in `index-new.html`
3. Handle UI event in `UIController.js`
4. Connect to worker in `app.js`

#### Custom Rendering
1. Extend or modify `IsingRenderer.js`
2. Add new canvas elements as needed
3. Update render calls in `app.js`

#### Performance Tuning
- Adjust `stepsPerFrame` in simulation controller
- Modify `frameRate` in app configuration
- Customize worker message frequency

## Browser Compatibility

- Modern browsers with Web Worker support
- Canvas 2D rendering support
- ES6+ JavaScript features

## Future Enhancements

Potential areas for expansion:

1. **Multiple Lattice Types** - Triangular, hexagonal grids
2. **Advanced Algorithms** - Cluster updates, parallel tempering
3. **Data Export** - CSV export of magnetization data
4. **3D Visualization** - WebGL-based 3D lattice rendering
5. **Real-time Analytics** - Energy, correlation functions
6. **Presets System** - Save/load simulation configurations
7. **Educational Mode** - Step-by-step algorithm explanation

## Performance Notes

- Web Worker keeps UI responsive during calculation
- Canvas rendering optimized for pixel-level operations
- Memory-efficient lattice representation using typed arrays
- Configurable update frequencies to balance performance and smoothness