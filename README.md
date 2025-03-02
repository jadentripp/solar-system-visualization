# Solar System Visualization

An interactive 3D visualization of our solar system using Three.js.

## Features

- **Realistic Proportions**: Planets are sized and positioned with accurate relative proportions to each other
- **Texture Mapping**: High-quality textures for all planets and 20+ major moons
- **Interactive Controls**: Multiple viewing options and planet focus capabilities
- **Planet Tracking**: Camera follows planets through their orbits when focused
- **Moon Exploration**: View details and focus on each planet's moons
- **Detailed Information**: Fact panels for each celestial body
- **Dwarf Planet**: Includes Pluto with special dwarf planet indicator

## Demo

To see the visualization in action, you need to serve the files through a web server. The easiest way is to use Python's built-in HTTP server:

### Using Python 3:

1. Open a terminal or command prompt
2. Navigate to the directory containing the project files
3. Run the following command:
   ```
   python -m http.server
   ```
   or
   ```
   python3 -m http.server
   ```
4. Open your browser and go to `http://localhost:8000`

### Using Python 2:

1. Open a terminal or command prompt
2. Navigate to the directory containing the project files
3. Run the following command:
   ```
   python -m SimpleHTTPServer
   ```
4. Open your browser and go to `http://localhost:8000`

This is necessary because the visualization uses JavaScript features that require it to be served from a web server rather than opened directly as a file.

## Controls

1. Different viewing angles:
   - **Overview**: A distant view showing the entire solar system
   - **Reset View**: Return to the default viewing position
   - **Top View**: Bird's eye view from above the solar system
   - **Sun View**: Close-up view of the sun

2. Planet focus:
   - Click on any planet name to focus the camera on it
   - When a planet is focused, the camera will automatically follow it in its orbit
   - Click "Stop Tracking" to remain in the current position

3. Moon exploration:
   - When focusing on a planet with moons, its moons will be displayed in a draggable panel
   - Click on any moon to focus on it

4. Mouse/touch controls for manual navigation:
   - Click and drag to rotate the view
   - Scroll to zoom in and out

## Technology

This visualization uses Three.js for 3D rendering and OrbitControls for camera manipulation.

## Technical Details

- Realistic scale ratios between planets (though distances are compressed)
- Dynamic texture loading with multiple fallback options
- Optimized performance for smooth animation
- Responsive design that works on desktop and mobile devices
- Camera tracking maintains relative position to planets as they orbit
- Informative fact panels for all celestial bodies
- Special visual indicators for dwarf planets
- Multiple layers of stars for a more realistic background
- Orbit paths displayed for all planets

## Future Improvements

- Adding asteroid belt visualization
- Including additional dwarf planets (Ceres, Eris, Haumea, Makemake)
- Adding Pluto's moons (Charon, Nix, Styx, Kerberos, Hydra)
- Implementing orbit speed controls

## Local Development

To run the visualization locally:

1. Clone this repository
2. Navigate to the project directory
3. Start a local web server using Python (as described in the Demo section)
4. Open your browser and visit http://localhost:8000

## Development Tools

This project was developed with the assistance of:

- **Claude 3.7 Sonnet**: Anthropic's most advanced AI model, featuring extended thinking capabilities and specialized skills in coding and front-end web development. Claude 3.7 Sonnet provides step-by-step reasoning and can handle complex visualization tasks with high accuracy.

- **Cursor AI**: An intelligent code editor that integrates AI assistants like Claude directly into the development workflow. Cursor enhances productivity through features like code generation, explanation, and refactoring, making it the ideal environment for building complex visualizations like this interactive solar system.

The combination of Claude 3.7 Sonnet's reasoning capabilities and Cursor AI's integrated development environment enabled the creation of this scientifically accurate, interactive 3D solar system visualization with detailed celestial bodies, realistic textures, and educational information.