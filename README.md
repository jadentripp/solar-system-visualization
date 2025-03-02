# Solar System Visualization

An interactive 3D visualization of our solar system using Three.js.

## Features

- **Realistic Proportions**: Planets are sized accurately relative to each other
- **Texture Mapping**: High-quality textures for all planets and major moons
- **Interactive Controls**: Multiple viewing options and planet focus capabilities
- **Planet Tracking**: Camera follows planets through their orbits when focused
- **Moon Exploration**: View details and focus on moons of each planet

## Demo

To see the visualization in action, simply open the `index.html` file in your web browser.

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
- Dynamic texture loading with fallback generation
- Optimized performance for smooth animation
- Responsive design that works on desktop and mobile devices
- Camera tracking maintains relative position to planets as they orbit

## Future Improvements

- Adding asteroid belt visualization
- Including dwarf planets like Pluto
- Adding more detailed information about celestial bodies
- Implementing orbit speed controls

## Local Development

To run the visualization locally:

1. Clone this repository
2. Make sure the `textures`