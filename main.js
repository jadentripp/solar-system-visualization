import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Initialize welcome modal functionality
const welcomeModal = document.getElementById('welcome-modal');
const welcomeCloseButton = document.getElementById('welcome-close');

// Add event listener to close the welcome modal when the close button is clicked
welcomeCloseButton.addEventListener('click', () => {
    // Add a fade out animation
    welcomeModal.style.animation = 'fadeOut 0.5s forwards';
    
    // After animation completes, hide the modal
    setTimeout(() => {
        welcomeModal.style.display = 'none';
    }, 500);
});

// Initialize the "Start Anyway" button in the loading screen
const initButton = document.getElementById('init-button');
if (initButton) {
    initButton.addEventListener('click', () => {
        // Hide the loading screen with animation
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            loadingScreen.style.animation = 'loadingFadeOut 0.8s forwards';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                addDebugMessage("Loading screen bypassed by user");
                addMessage("Starting visualization with available textures...", 3000);
            }, 800);
        }
    });
}

// Add CSS for the fade out animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.innerHTML = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes loadingFadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -70%); }
    }
`;
document.head.appendChild(fadeOutStyle);

// Add renderer shadow settings for better lighting
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Sunlight (point light at the center)
const sunLight = new THREE.PointLight(0xffffaa, 5); // Increased intensity and warmer color
scene.add(sunLight);

// Add a hemisphere light for better overall illumination
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.5); // Increased intensity
scene.add(hemisphereLight);

// Add a directional light to help illuminate planets from another angle
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(100, 100, 100);
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 10000;

// Camera initial position - start closer to Earth for better initial view
camera.position.set(0, 100, 300);
controls.update();

// Initial animation sequence
let initialAnimationComplete = false;
let initialAnimationProgress = 0;
const ANIMATION_DURATION = 8; // seconds

// Target positions for smooth camera movement
const initialPosition = new THREE.Vector3(0, 100, 300);
const finalPosition = new THREE.Vector3(0, 500, 1500);

// Function to perform smooth initial animation
function performInitialAnimation(deltaTime) {
    if (initialAnimationComplete) return;
    
    initialAnimationProgress += deltaTime;
    const progress = Math.min(initialAnimationProgress / ANIMATION_DURATION, 1);
    
    // Ease out cubic function for smooth deceleration
    const easeOutCubic = function(t) {
        return 1 - Math.pow(1 - t, 3);
    };
    
    const easedProgress = easeOutCubic(progress);
    
    // Interpolate between initial and final positions
    const newPosition = initialPosition.clone().lerp(finalPosition, easedProgress);
    camera.position.copy(newPosition);
    
    // Slowly increase the FOV for a zoom-out effect
    camera.fov = 75 + (easedProgress * 5);
    camera.updateProjectionMatrix();
    
    // Rotate the camera slightly around the scene
    scene.rotation.y = easedProgress * 0.2;
    
    if (progress >= 1) {
        initialAnimationComplete = true;
        // Enable controls once animation is complete
        controls.enabled = true;
    }
}

// Disable controls during initial animation
controls.enabled = false;

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create stars background
function createStars() {
    // Create multiple star layers with different sizes and colors for more depth
    
    // Layer 1: Distant small stars (numerous)
    const smallStarsGeometry = new THREE.BufferGeometry();
    const smallStarsMaterial = new THREE.PointsMaterial({
        color: 0xaaaaff,
        size: 0.8,
        sizeAttenuation: false
    });

    const smallStarsVertices = [];
    for (let i = 0; i < 40000; i++) {
        const x = THREE.MathUtils.randFloatSpread(20000);
        const y = THREE.MathUtils.randFloatSpread(20000);
        const z = THREE.MathUtils.randFloatSpread(20000);
        smallStarsVertices.push(x, y, z);
    }

    smallStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(smallStarsVertices, 3));
    const smallStars = new THREE.Points(smallStarsGeometry, smallStarsMaterial);
    scene.add(smallStars);
    
    // Layer 2: Medium stars with slight blue tint
    const mediumStarsGeometry = new THREE.BufferGeometry();
    const mediumStarsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        sizeAttenuation: false
    });

    const mediumStarsVertices = [];
    for (let i = 0; i < 15000; i++) {
        const x = THREE.MathUtils.randFloatSpread(15000);
        const y = THREE.MathUtils.randFloatSpread(15000);
        const z = THREE.MathUtils.randFloatSpread(15000);
        mediumStarsVertices.push(x, y, z);
    }

    mediumStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(mediumStarsVertices, 3));
    const mediumStars = new THREE.Points(mediumStarsGeometry, mediumStarsMaterial);
    scene.add(mediumStars);
    
    // Layer 3: Bright foreground stars with varied colors
    const brightStarsGeometry = new THREE.BufferGeometry();
    
    // Create varied colors for bright stars
    const brightStarsColors = [];
    const brightStarsVertices = [];
    
    // Star colors (white, yellow, blue, orange)
    const starColors = [
        new THREE.Color(0xffffff), // white
        new THREE.Color(0xffffaa), // yellow
        new THREE.Color(0xaaddff), // blue
        new THREE.Color(0xffaa55)  // orange
    ];
    
    for (let i = 0; i < 5000; i++) {
        const x = THREE.MathUtils.randFloatSpread(10000);
        const y = THREE.MathUtils.randFloatSpread(10000);
        const z = THREE.MathUtils.randFloatSpread(10000);
        brightStarsVertices.push(x, y, z);
        
        // Random color from our palette
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        brightStarsColors.push(color.r, color.g, color.b);
    }

    brightStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(brightStarsVertices, 3));
    brightStarsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(brightStarsColors, 3));
    
    const brightStarsMaterial = new THREE.PointsMaterial({
        size: 2.5,
        vertexColors: true,
        sizeAttenuation: false
    });
    
    const brightStars = new THREE.Points(brightStarsGeometry, brightStarsMaterial);
    scene.add(brightStars);
    
    // Layer 4: Add a few "twinkling" stars (will be animated)
    const twinklingStarsGeometry = new THREE.BufferGeometry();
    const twinklingStarsVertices = [];
    
    for (let i = 0; i < 200; i++) {
        const x = THREE.MathUtils.randFloatSpread(5000);
        const y = THREE.MathUtils.randFloatSpread(5000);
        const z = THREE.MathUtils.randFloatSpread(5000);
        twinklingStarsVertices.push(x, y, z);
    }
    
    twinklingStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(twinklingStarsVertices, 3));
    
    const twinklingStarsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3,
        sizeAttenuation: false,
        transparent: true,
        opacity: 1
    });
    
    const twinklingStars = new THREE.Points(twinklingStarsGeometry, twinklingStarsMaterial);
    scene.add(twinklingStars);
    
    // Store twinkling stars for animation
    window.twinklingStars = twinklingStars;
    
    // Remove the scale info div and use the better planet info panel
    const scaleInfoDiv = document.getElementById('scale-info');
    if (scaleInfoDiv) {
        scaleInfoDiv.innerHTML = `
            <p>Distances are to scale with real solar system (1 AU = 150 units)</p>
            <p>Planet sizes are relative but not to scale with distances</p>
            <p>Pluto is shown as a dwarf planet (reclassified in 2006)</p>
        `;
    }
}

// Add debug info display 
const debugInfo = document.createElement('div');
debugInfo.style.position = 'absolute';
debugInfo.style.bottom = '10px';
debugInfo.style.right = '10px';
debugInfo.style.color = 'white';
debugInfo.style.background = 'rgba(0,0,0,0.5)';
debugInfo.style.padding = '5px';
debugInfo.style.fontFamily = 'monospace';
debugInfo.style.fontSize = '12px';
debugInfo.style.zIndex = '1000';
debugInfo.style.maxHeight = '100px';
debugInfo.style.maxWidth = '400px';
debugInfo.style.overflow = 'auto';
debugInfo.style.display = 'none'; // Hide by default
document.body.appendChild(debugInfo);

// Add debug toggle button
const debugToggle = document.createElement('button');
debugToggle.textContent = 'Debug: Off';
debugToggle.style.position = 'absolute';
debugToggle.style.bottom = '10px';
debugToggle.style.right = '10px';
debugToggle.style.zIndex = '1001';
debugToggle.style.background = 'rgba(0,0,0,0.5)';
debugToggle.style.color = 'white';
debugToggle.style.border = '1px solid #555';
debugToggle.style.borderRadius = '4px';
debugToggle.style.padding = '5px 10px';
debugToggle.style.fontSize = '12px';
debugToggle.style.cursor = 'pointer';
document.body.appendChild(debugToggle);

// Toggle debug info visibility
debugToggle.addEventListener('click', () => {
    if (debugInfo.style.display === 'none') {
        debugInfo.style.display = 'block';
        debugToggle.textContent = 'Debug: On';
    } else {
        debugInfo.style.display = 'none';
        debugToggle.textContent = 'Debug: Off';
    }
});

// Limit the debug messages to prevent overflowing
let debugMessages = 0;
const MAX_DEBUG_MESSAGES = 30;

// Function to add debug message with limit
function addDebugMessage(message) {
    if (debugMessages > MAX_DEBUG_MESSAGES) {
        // Clear older messages if we have too many
        debugInfo.innerHTML = `<div>Debug cleared (too many messages)</div>`;
        debugMessages = 0;
    }
    
    debugInfo.innerHTML += `<div>${message}</div>`;
    debugMessages++;
    
    // Auto-scroll to bottom
    debugInfo.scrollTop = debugInfo.scrollHeight;
}

// Configuration for texture URLs with multiple fallbacks
const TEXTURE_URLS = {
    sun: ['textures/sun.jpg', 
          'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/sun.jpg',
          'https://www.solarsystemscope.com/textures/download/2k_sun.jpg'],
    mercury: ['textures/mercury.jpg', 
              'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/mercury.jpg',
              'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg'],
    venus: ['textures/venus.jpg', 
            'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/venus.jpg',
            'https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg'],
    earth: ['textures/earth.jpg', 
            'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/earth.jpg',
            'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg'],
    mars: ['textures/mars.jpg', 
           'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/mars.jpg',
           'https://www.solarsystemscope.com/textures/download/2k_mars.jpg'],
    jupiter: ['textures/jupiter.jpg', 
              'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/jupiter.jpg',
              'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg'],
    saturn: ['textures/saturn.jpg', 
             'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/saturn.jpg',
             'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg'],
    uranus: ['textures/uranus.jpg', 
             'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/uranus.jpg',
             'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg'],
    neptune: ['textures/neptune.jpg', 
              'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/neptune.jpg',
              'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg'],
    pluto: [
        'https://www.solarsystemscope.com/textures/download/2k_pluto.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/600px-Pluto_in_True_Color_-_High-Res.jpg'],
    moon: ['textures/moon.jpg', 
           'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004887/frames/730x730_1x1_30p/moon.jpg',
           'https://www.solarsystemscope.com/textures/download/2k_moon.jpg'],
    // Mars moons
    phobos: [
             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Phobos_colour_2008.jpg/600px-Phobos_colour_2008.jpg'],
    deimos: [
             'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Deimos-MRO.jpg/600px-Deimos-MRO.jpg'],
    // Jupiter moons
    io: [
        'https://www.solarsystemscope.com/textures/download/2k_io.jpg',
         'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Io_highest_resolution_true_color.jpg/600px-Io_highest_resolution_true_color.jpg'],
    europa: [
        'https://www.solarsystemscope.com/textures/download/2k_europa.jpg',
             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Europa-moon.jpg/600px-Europa-moon.jpg'],
    ganymede: [
        'https://www.solarsystemscope.com/textures/download/2k_ganymede.jpg',
               'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Ganymede_g1_true-edit1.jpg/600px-Ganymede_g1_true-edit1.jpg'],
    callisto: [
        'https://www.solarsystemscope.com/textures/download/2k_callisto.jpg',
               'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Callisto.jpg/600px-Callisto.jpg'],
    // Saturn moons
    titan: [
            'https://www.solarsystemscope.com/textures/download/2k_titan.jpg'],
    enceladus: [
                'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/PIA17202_-_Approaching_Enceladus.jpg/800px-PIA17202_-_Approaching_Enceladus.jpg'],
    mimas: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Mimas_Cassini.jpg/800px-Mimas_Cassini.jpg'],
    iapetus: [
              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Iapetus_706_1419_1.jpg/800px-Iapetus_706_1419_1.jpg'],
    rhea: [
           'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/PIA07763_Rhea_full_globe5.jpg/800px-PIA07763_Rhea_full_globe5.jpg'],
    // Uranus moons
    titania: [
              'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Titania_%28moon%29_color%2C_edited.jpg/800px-Titania_%28moon%29_color%2C_edited.jpg'],
    oberon: [
             'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Voyager_2_picture_of_Oberon.jpg/800px-Voyager_2_picture_of_Oberon.jpg'],
    ariel: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Ariel_%28moon%29.jpg/800px-Ariel_%28moon%29.jpg'],
    umbriel: [
              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Umbriel_%28moon%29.jpg/800px-Umbriel_%28moon%29.jpg'],
    miranda: [
              'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Miranda.jpg/800px-Miranda.jpg'],
    // Neptune moons
    triton: [
             'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Triton_moon_mosaic_Voyager_2_%28large%29.jpg/800px-Triton_moon_mosaic_Voyager_2_%28large%29.jpg'],
    proteus: [
              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Proteus_%28Voyager_2%29.jpg/800px-Proteus_%28Voyager_2%29.jpg'],
    nereid: [
             'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PIA02706_-_Neptune%27s_moon_Nereid_%28cropped%29.jpg/800px-PIA02706_-_Neptune%27s_moon_Nereid_%28cropped%29.jpg']
};

// Function to load texture with better error handling and fallbacks
function loadTexture(planetName, urls, material, callback, totalToLoad) {
    if (!Array.isArray(urls)) {
        urls = [urls]; // Convert single URL to array
    }
    
    // Track attempt number
    let attemptIndex = 0;
    let timeoutId = null;
    
    // Check if we're using a local or remote texture
    const isUsingLocalTexture = urls[0].startsWith('textures/');
    
    // Add diagnostic info to UI
    updateLoadingStatus(`Loading texture for ${planetName}...`);
    
    // Define the recursive loading function
    function loadTextureAttempt() {
        if (attemptIndex >= urls.length) {
            // All URLs failed, create a fallback texture
            console.warn(`All texture URLs failed for ${planetName}. Using fallback.`);
            const fallbackTexture = createFallbackTexture(planetName);
            applyTextureToMaterial(fallbackTexture, material);
            
            // Show a more prominent message to the user about fallback textures
            addMessage(`Using generated texture for ${planetName}`, 3000);
            
            // Add a ui notification that appears in the corner
            showNotification(`Using generated texture for ${planetName}`, 'warning');
            
            // Update loading status
            updateLoadingStatus(`Created fallback for ${planetName}`);
            
            if (callback) callback();
            
            // Check if we're done loading textures
            checkLoadingComplete();
            
            return;
        }
        
        // Set a timeout to catch silent failures
        timeoutId = setTimeout(() => {
            console.warn(`Texture load timeout for ${planetName} (attempt ${attemptIndex + 1}/${urls.length})`);
            attemptIndex++;
            loadTextureAttempt();
        }, 10000); // 10 second timeout
        
        // Try to load the texture
        const url = urls[attemptIndex];
        const loader = new THREE.TextureLoader();
        
        // If we're using an online URL and it's not our first choice, let the user know
        if (!isUsingLocalTexture || (attemptIndex > 0 && url.includes('http'))) {
            addMessage(`Loading ${planetName} texture from online source...`, 3000);
            showNotification(`Using online source for ${planetName} texture`, 'info');
        }
        
        loader.load(
            url,
            (texture) => {
                // Success - texture loaded
                clearTimeout(timeoutId);
                
                // Set texture properties
                texture.colorSpace = THREE.SRGBColorSpace;
                
                // Apply the texture to the material
                applyTextureToMaterial(texture, material);
                
                // Update loading message
                updateLoadingStatus(`Loaded ${planetName} (${attemptIndex + 1}/${urls.length})`);
                
                if (callback) callback();
                
                // Check if we're done loading textures
                checkLoadingComplete();
            },
            (xhr) => {
                // Progress callback (optional - could be used to show loading progress)
                // Only log for large textures
                if (xhr.total > 1000000) { // If > 1MB
                    const percent = Math.round((xhr.loaded / xhr.total) * 100);
                    updateLoadingStatus(`Loading ${planetName}: ${percent}%`);
                }
            },
            (error) => {
                // Error callback
                clearTimeout(timeoutId);
                console.error(`Failed to load texture for ${planetName} from ${url}:`, error);
                    
                // Try the next URL
                attemptIndex++;
                loadTextureAttempt();
            }
        );
    }
    
    // Start the loading process
    loadTextureAttempt();
}

// Track texture loading progress
let totalTexturesToLoad = Object.keys(TEXTURE_URLS).length;
let texturesLoaded = 0;

// Function to check if all textures are loaded and hide loading screen
function checkLoadingComplete() {
    texturesLoaded++;
    
    // Update loading percentage
    const percentage = Math.min(Math.round((texturesLoaded / totalTexturesToLoad) * 100), 100);
    updateLoadingStatus(`Loading textures: ${percentage}%`);
    
    // If all textures are loaded, hide the loading screen
    if (texturesLoaded >= totalTexturesToLoad) {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading');
            if (loadingScreen) {
                loadingScreen.style.animation = 'loadingFadeOut 1s forwards';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    addDebugMessage("All textures loaded, loading screen hidden");
                    addMessage("Visualization ready!", 3000);
                }, 1000);
            }
        }, 500); // Short delay to show 100% before hiding
    }
}

// Function to apply texture to material with consistency
function applyTextureToMaterial(texture, material) {
    if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
        material.map = texture;
        material.needsUpdate = true;
    } else if (material.isShaderMaterial) {
        material.uniforms.map.value = texture;
        material.needsUpdate = true;
    } else {
        console.warn('Unknown material type for texture application');
        material.map = texture;
        material.needsUpdate = true;
    }
}

// Function to update the loading status in the UI
function updateLoadingStatus(message) {
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
        loadingStatus.textContent = message;
    }
    
    // Also log to debug panel if available
    addDebugMessage(message);
}

// Function to show temporary messages to the user
function addMessage(message, duration = 5000) {
    // Create or get the message container
    let messageContainer = document.getElementById('message-container');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.style.position = 'fixed';
        messageContainer.style.bottom = '20px';
        messageContainer.style.left = '20px';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.pointerEvents = 'none'; // Don't capture clicks
        document.body.appendChild(messageContainer);
    }
    
    // Create the message element
    const messageEl = document.createElement('div');
    messageEl.className = 'user-message';
    messageEl.textContent = message;
    messageEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    messageEl.style.color = 'white';
    messageEl.style.padding = '10px 15px';
    messageEl.style.borderRadius = '5px';
    messageEl.style.marginTop = '10px';
    messageEl.style.maxWidth = '300px';
    messageEl.style.opacity = '0';
    messageEl.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add to container
    messageContainer.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            messageContainer.removeChild(messageEl);
        }, 300);
    }, duration);
}

// Function to create a fallback texture
function createFallbackTexture(planetName) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    let gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    let primaryColor, secondaryColor, details;
    
    // Set colors based on planet or moon
    switch(planetName.toLowerCase()) {
        // Planets
        case 'mercury':
            primaryColor = '#aaa';
            secondaryColor = '#777';
            details = 'crater';
            break;
        case 'venus':
            primaryColor = '#e9d8a6';
            secondaryColor = '#d9b86e';
            details = 'swirl';
            break;
        case 'earth':
            primaryColor = '#2a73c9';
            secondaryColor = '#186a3b';
            details = 'land';
            break;
        case 'mars':
            primaryColor = '#c0392b';
            secondaryColor = '#cd6155';
            details = 'crater';
            break;
        case 'jupiter':
            primaryColor = '#e67e22';
            secondaryColor = '#f39c12';
            details = 'stripe';
            break;
        case 'saturn':
            primaryColor = '#f7dc6f';
            secondaryColor = '#f4d03f';
            details = 'stripe';
            break;
        case 'uranus':
            primaryColor = '#85c1e9';
            secondaryColor = '#3498db';
            details = 'smooth';
            break;
        case 'neptune':
            primaryColor = '#3498db';
            secondaryColor = '#2874a6';
            details = 'smooth';
            break;
        case 'pluto':
            primaryColor = '#bdc3c7';
            secondaryColor = '#95a5a6';
            details = 'crater';
            break;
            
        // Earth's moon
        case 'moon':
            primaryColor = '#d5d5d5';
            secondaryColor = '#a5a5a5';
            details = 'crater';
            break;
            
        // Mars moons
        case 'phobos':
            primaryColor = '#a88d75';
            secondaryColor = '#806354';
            details = 'crater';
            break;
        case 'deimos':
            primaryColor = '#baa89c';
            secondaryColor = '#9c9080';
            details = 'crater';
            break;
            
        // Jupiter moons
        case 'io':
            primaryColor = '#ebc00d';
            secondaryColor = '#e57e25';
            details = 'volcanic';
            break;
        case 'europa':
            primaryColor = '#d0c0b0';
            secondaryColor = '#b0a090';
            details = 'cracked';
            break;
        case 'ganymede':
            primaryColor = '#9c8a7d';
            secondaryColor = '#7a6d62';
            details = 'mixed';
            break;
        case 'callisto':
            primaryColor = '#6b5a4c';
            secondaryColor = '#504030';
            details = 'crater';
            break;
            
        // Saturn moons
        case 'titan':
            primaryColor = '#e89c45';
            secondaryColor = '#c97c35';
            details = 'haze';
            break;
        case 'enceladus':
            primaryColor = '#f0f0f0';
            secondaryColor = '#e0e0e0';
            details = 'cracked';
            break;
        case 'mimas':
            primaryColor = '#dcdcdc';
            secondaryColor = '#b0b0b0';
            details = 'crater';
            break;
        case 'iapetus':
            primaryColor = '#d0d0d0';
            secondaryColor = '#505050'; // dual-toned
            details = 'mixed';
            break;
        case 'rhea':
            primaryColor = '#d5d5d5';
            secondaryColor = '#b5b5b5';
            details = 'crater';
            break;
            
        // Uranus moons
        case 'titania':
            primaryColor = '#a0a0a0';
            secondaryColor = '#707070';
            details = 'crater';
            break;
        case 'oberon':
            primaryColor = '#909090';
            secondaryColor = '#606060';
            details = 'crater';
            break;
        case 'umbriel':
            primaryColor = '#707070';
            secondaryColor = '#505050';
            details = 'dark';
            break;
        case 'ariel':
            primaryColor = '#c0c0c0';
            secondaryColor = '#909090';
            details = 'cracked';
            break;
        case 'miranda':
            primaryColor = '#b0b0b0';
            secondaryColor = '#808080';
            details = 'mixed';
            break;
            
        // Neptune moons
        case 'triton':
            primaryColor = '#a0c0d0';
            secondaryColor = '#809aa8';
            details = 'cracked';
            break;
        case 'proteus':
            primaryColor = '#808080';
            secondaryColor = '#606060';
            details = 'dark';
            break;
        case 'nereid':
            primaryColor = '#a0a0a0';
            secondaryColor = '#707070';
            details = 'mixed';
            break;
            
        // Default for unknown objects
        default:
            primaryColor = '#b0b0b0';
            secondaryColor = '#909090';
            details = 'mixed';
            addDebugMessage(`Using generic texture for unknown object: ${planetName}`);
            break;
    }
    
    // Apply gradient
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw details based on the type
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    
    switch(details) {
        case 'crater':
            // Add craters
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = 5 + Math.random() * 20;
                
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add crater rim highlight
                ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
                ctx.stroke();
            }
            break;
            
        case 'stripe':
            // Add bands for gas giants
            for (let i = 0; i < 8; i++) {
                const y = i * 32;
                const height = 15 + Math.random() * 10;
                const alpha = Math.random() * 0.3 + 0.1;
                
                // Alternate dark and light bands
                if (i % 2 === 0) {
                    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
                }
                    
                ctx.fillRect(0, y, 256, height);
            }
            break;
            
        case 'land':
            // Add continent-like shapes for terrestrial planets
            ctx.fillStyle = 'rgba(0,100,0,0.4)';
            for (let i = 0; i < 7; i++) {
                ctx.beginPath();
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                
                // Create irregular shape
                ctx.moveTo(x, y);
                
                for (let a = 0; a < Math.PI * 2; a += 0.3) {
                    const radius = 20 + Math.random() * 40;
                    const newX = x + Math.cos(a) * radius;
                    const newY = y + Math.sin(a) * radius;
                    ctx.lineTo(newX, newY);
                }
                
                ctx.closePath();
                ctx.fill();
            }
            break;
            
        case 'swirl':
            // Add cloud-like swirls
            for (let i = 0; i < 5; i++) {
                const centerX = Math.random() * 256;
                const centerY = Math.random() * 256;
                const radius = 30 + Math.random() * 50;
                const rotation = Math.random() * Math.PI * 2;
                
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4})`;
                
                ctx.beginPath();
                for (let a = 0; a < Math.PI * 6; a += 0.1) {
                    const r = radius * (1 - a / (Math.PI * 6));
                    const x = centerX + r * Math.cos(a + rotation);
                    const y = centerY + r * Math.sin(a + rotation);
                    
                    if (a === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.fill();
            }
            break;
            
        case 'smooth':
            // Add subtle variations in color for icy planets
            ctx.globalAlpha = 0.2;
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = 30 + Math.random() * 50;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
            break;
            
        case 'volcanic':
            // Add volcanic features similar to Io
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(0, 0, 256, 256);
            
            // Add volcanic spots
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = 5 + Math.random() * 15;
                
                // Create colorful volcanic spots
                const colors = ['#ff5500', '#ff0000', '#aa0000', '#ffaa00'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect
                const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
                glow.addColorStop(0, 'rgba(255,100,0,0.5)');
                glow.addColorStop(1, 'rgba(255,100,0,0)');
                
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'cracked':
            // Create ice cracks like on Europa
            ctx.strokeStyle = 'rgba(0,30,100,0.3)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                const startX = Math.random() * 256;
                const startY = Math.random() * 256;
                ctx.moveTo(startX, startY);
                
                let x = startX;
                let y = startY;
                
                // Create jagged line
                const points = 3 + Math.floor(Math.random() * 6);
                
                for (let j = 0; j < points; j++) {
                    x += (Math.random() - 0.5) * 80;
                    y += (Math.random() - 0.5) * 80;
                    ctx.lineTo(x, y);
                }
                
                ctx.stroke();
            }
            break;
            
        case 'dark':
            // For very dark moons
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, 256, 256);
            
            // Add subtle light patches
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = 10 + Math.random() * 20;
                
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'mixed':
            // Mixture of features
            // Add some craters
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = 2 + Math.random() * 8;
                
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // And some regions
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                
                ctx.moveTo(x, y);
                
                // Create irregular shape
                for (let a = 0; a < Math.PI * 2; a += 0.2) {
                    const radius = 10 + Math.random() * 40;
                    const newX = x + Math.cos(a) * radius;
                    const newY = y + Math.sin(a) * radius;
                    ctx.lineTo(newX, newY);
                }
                
                ctx.closePath();
                ctx.fill();
            }
            break;
            
        case 'haze':
            // Hazy atmosphere like Titan
            ctx.fillStyle = 'rgba(255,180,30,0.2)';
            for (let i = 0; i < 8; i++) {
                const y = i * 32;
                ctx.fillRect(0, y, 256, 15);
            }
            break;
    }
    
    // Add planet/moon name as text
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(planetName, 128, 128);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    addDebugMessage(`Created fallback texture for ${planetName}`);
    return texture;
}

// Increase sun size and make it more emissive
const SUN_RADIUS = 30;

// Update planet data colors to be more vibrant
const planetData = [
    { 
        name: 'Sun', 
        radius: SUN_RADIUS,
        distance: 0, 
        rotationSpeed: 0.004, 
        orbitSpeed: 0, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/sun.jpg',
        emissive: true,
        color: 0xffdd00 // Brighter yellow for sun
    },
    { 
        name: 'Mercury', 
        radius: 0.38 * 3, 
        distance: 58, // 0.39 AU
        rotationSpeed: 0.004, 
        orbitSpeed: 0.012, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mercury.jpg',
        color: 0xbbbbbb // Brighter gray
    },
    { 
        name: 'Venus', 
        radius: 0.95 * 3, 
        distance: 108, // 0.72 AU 
        rotationSpeed: 0.002, 
        orbitSpeed: 0.007, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/venus.jpg',
        color: 0xfff1c9 // Brighter yellowish
    },
    { 
        name: 'Earth', 
        radius: 3, 
        distance: 150, // 1.0 AU (reference)
        rotationSpeed: 0.01, 
        orbitSpeed: 0.005, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth.jpg',
        color: 0x2d9bf0 // Brighter blue
    },
    { 
        name: 'Mars', 
        radius: 0.53 * 3, 
        distance: 228, // 1.52 AU
        rotationSpeed: 0.008, 
        orbitSpeed: 0.003, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars.jpg',
        color: 0xff5500 // Vibrant red
    },
    { 
        name: 'Jupiter', 
        radius: 11.2 * 3, 
        distance: 778, // 5.2 AU
        rotationSpeed: 0.04, 
        orbitSpeed: 0.001, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg',
        color: 0xf0c384 // Brighter beige
    },
    { 
        name: 'Saturn', 
        radius: 9.45 * 3, 
        distance: 1427, // 9.5 AU
        rotationSpeed: 0.038, 
        orbitSpeed: 0.0008, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn.jpg',
        hasRings: true,
        color: 0xf7e9b9 // Brighter beige
    },
    { 
        name: 'Uranus', 
        radius: 4.01 * 3, 
        distance: 2870, // 19.1 AU
        rotationSpeed: 0.03, 
        orbitSpeed: 0.0004, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/uranus.jpg',
        color: 0x9df5ff // Bright light blue
    },
    { 
        name: 'Neptune', 
        radius: 3.88 * 3, 
        distance: 4500, // 30.0 AU
        rotationSpeed: 0.032, 
        orbitSpeed: 0.0003, 
        texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/neptune.jpg',
        color: 0x5580ff // Bright blue
    },
    { 
        name: 'Pluto', 
        radius: 0.18 * 3, // About 18% of Earth's radius
        distance: 5925, // 39.5 AU 
        rotationSpeed: 0.005, 
        orbitSpeed: 0.0001, // Very slow orbit
        texture: 'https://www.solarsystemscope.com/textures/download/2k_pluto.jpg',
        isDwarf: true, // Mark as dwarf planet
        color: 0xbbaa99 // Brownish gray
    }
];

// Moon data for the solar system
const moonData = [
    // Earth's moon (already implemented but added here for consistency)
    { 
        planetName: 'Earth',
        name: 'Moon', 
        radius: 0.27 * 3, // About 27% of Earth's radius
        distance: 2, // Distance from planet in planet radii
        rotationSpeed: 0.015,
        orbitSpeed: 0.015,
        texture: 'moon', // Use moon name to reference TEXTURE_URLS
        color: 0xdeddda
    },
    // Mars' moons
    {
        planetName: 'Mars',
        name: 'Phobos',
        radius: 0.008 * 3, // Very small relative to Mars
        distance: 1.6, // Very close to Mars
        rotationSpeed: 0.01,
        orbitSpeed: 0.03, // Orbits quickly
        texture: 'phobos', // Use moon name to reference TEXTURE_URLS
        color: 0x888888
    },
    {
        planetName: 'Mars',
        name: 'Deimos',
        radius: 0.004 * 3, // Tiny
        distance: 2.5,
        rotationSpeed: 0.008,
        orbitSpeed: 0.015,
        texture: 'deimos', // Use moon name to reference TEXTURE_URLS
        color: 0x777777
    },
    // Jupiter's major moons (Galilean moons)
    {
        planetName: 'Jupiter',
        name: 'Io',
        radius: 0.286 * 3, // Relative to Earth
        distance: 1.3,
        rotationSpeed: 0.01,
        orbitSpeed: 0.02,
        texture: 'io', // Use moon name to reference TEXTURE_URLS
        color: 0xfff499 // Yellowish
    },
    {
        planetName: 'Jupiter',
        name: 'Europa',
        radius: 0.245 * 3,
        distance: 1.5,
        rotationSpeed: 0.008,
        orbitSpeed: 0.015,
        texture: 'europa', // Use moon name to reference TEXTURE_URLS
        color: 0xccccbb // Icy white
    },
    {
        planetName: 'Jupiter',
        name: 'Ganymede',
        radius: 0.413 * 3, // Largest moon in the solar system
        distance: 1.8,
        rotationSpeed: 0.006,
        orbitSpeed: 0.01,
        texture: 'ganymede', // Use moon name to reference TEXTURE_URLS
        color: 0xaabbcc // Mixed rocky/icy
    },
    {
        planetName: 'Jupiter',
        name: 'Callisto',
        radius: 0.378 * 3,
        distance: 2.1,
        rotationSpeed: 0.005,
        orbitSpeed: 0.008,
        texture: 'callisto', // Use moon name to reference TEXTURE_URLS
        color: 0x888899 // Dark gray
    },
    // Saturn's largest moon
    {
        planetName: 'Saturn',
        name: 'Titan',
        radius: 0.404 * 3, // Second largest moon in the solar system
        distance: 1.5,
        rotationSpeed: 0.007,
        orbitSpeed: 0.012,
        texture: 'titan', // Use moon name to reference TEXTURE_URLS
        color: 0xffbb66 // Orangish haze
    },
    // Additional Saturn moons
    {
        planetName: 'Saturn',
        name: 'Enceladus',
        radius: 0.04 * 3,
        distance: 1.8,
        rotationSpeed: 0.008,
        orbitSpeed: 0.014,
        texture: 'enceladus',
        color: 0xffffff // Icy white
    },
    {
        planetName: 'Saturn',
        name: 'Mimas',
        radius: 0.03 * 3,
        distance: 1.3,
        rotationSpeed: 0.009,
        orbitSpeed: 0.016,
        texture: 'mimas',
        color: 0xdddddd // Gray
    },
    {
        planetName: 'Saturn',
        name: 'Rhea',
        radius: 0.12 * 3,
        distance: 2.1,
        rotationSpeed: 0.007,
        orbitSpeed: 0.01,
        texture: 'rhea',
        color: 0xcccccc // Light gray
    },
    {
        planetName: 'Saturn',
        name: 'Iapetus',
        radius: 0.115 * 3,
        distance: 2.4,
        rotationSpeed: 0.006,
        orbitSpeed: 0.008,
        texture: 'iapetus',
        color: 0xaaaaaa // Mixed coloration
    },
    // Uranus' major moons
    {
        planetName: 'Uranus',
        name: 'Titania',
        radius: 0.124 * 3,
        distance: 1.6,
        rotationSpeed: 0.009,
        orbitSpeed: 0.014,
        texture: 'titania', // Use moon name to reference TEXTURE_URLS
        color: 0xdddddd // Light gray
    },
    {
        planetName: 'Uranus',
        name: 'Oberon',
        radius: 0.119 * 3,
        distance: 1.8,
        rotationSpeed: 0.008,
        orbitSpeed: 0.012,
        texture: 'oberon', // Use moon name to reference TEXTURE_URLS
        color: 0xcccccc // Light gray
    },
    // Additional Uranus moons
    {
        planetName: 'Uranus',
        name: 'Miranda',
        radius: 0.037 * 3,
        distance: 1.2,
        rotationSpeed: 0.01,
        orbitSpeed: 0.018,
        texture: 'miranda',
        color: 0xcccccc // Light gray
    },
    {
        planetName: 'Uranus',
        name: 'Ariel',
        radius: 0.09 * 3,
        distance: 1.4,
        rotationSpeed: 0.009,
        orbitSpeed: 0.016,
        texture: 'ariel',
        color: 0xdddddd // Light gray
    },
    {
        planetName: 'Uranus',
        name: 'Umbriel',
        radius: 0.092 * 3,
        distance: 1.7,
        rotationSpeed: 0.008,
        orbitSpeed: 0.013,
        texture: 'umbriel',
        color: 0x888888 // Dark gray
    },
    // Neptune's largest moon
    {
        planetName: 'Neptune',
        name: 'Triton',
        radius: 0.212 * 3,
        distance: 1.5,
        rotationSpeed: 0.006,
        orbitSpeed: 0.01,
        texture: 'triton', // Use moon name to reference TEXTURE_URLS
        color: 0xffddcc // Pinkish
    },
    // Additional Neptune moons
    {
        planetName: 'Neptune',
        name: 'Proteus',
        radius: 0.039 * 3,
        distance: 1.2,
        rotationSpeed: 0.008,
        orbitSpeed: 0.016,
        texture: 'proteus',
        color: 0x888888 // Gray
    },
    {
        planetName: 'Neptune',
        name: 'Nereid',
        radius: 0.027 * 3,
        distance: 2.2,
        rotationSpeed: 0.005,
        orbitSpeed: 0.007,
        texture: 'nereid',
        color: 0xaaaaaa // Light gray
    }
];

// Create orbit path
function createOrbitPath(radius) {
    const curve = new THREE.EllipseCurve(
        0, 0,            // Center x, y
        radius, radius,  // xRadius, yRadius
        0, 2 * Math.PI,  // startAngle, endAngle
        false,           // clockwise
        0                // rotation
    );

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({ 
        color: 0x666666, 
        transparent: true, 
        opacity: 0.5,
        linewidth: 2
    });
    const ellipse = new THREE.Line(geometry, material);
    ellipse.rotation.x = Math.PI / 2;
    
    return ellipse;
}

// Create celestial bodies
const celestialBodies = [];

function createPlanets() {
    const planetButtons = document.getElementById('planet-buttons');
    
    planetData.forEach(planet => {
        // Create planet mesh
        const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
        
        // Create a basic material first with just color - always works even if textures fail
        let material;
        
        if (planet.emissive) {
            // Special case for sun to make it brighter
            material = new THREE.MeshBasicMaterial({
                color: planet.color,
                emissive: planet.color,
                emissiveIntensity: 1
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: planet.color,
                emissive: new THREE.Color(planet.color).multiplyScalar(0.3),
                emissiveIntensity: 0.5,
                roughness: 0.5,
                metalness: 0.2
            });
        }
        
        // Load texture with the new system
        const textureUrls = TEXTURE_URLS[planet.name.toLowerCase()] || [planet.texture];
        loadTexture(planet.name, textureUrls, material, () => {
            addDebugMessage(`Planet ${planet.name} texture loaded or fallback created`);
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Create a container for each planet and its orbit
        const planetSystem = new THREE.Object3D();
        scene.add(planetSystem);
        
        // Position planet
        mesh.position.x = planet.distance;
        planetSystem.add(mesh);
        
        // Add a wireframe overlay to make planets more visible
        if (planet.name !== 'Sun') {
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true,
                opacity: 0.1
            });
            const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
            mesh.add(wireframe);
            
            // Add 3D label to each planet for easier identification
            const labelCanvas = document.createElement('canvas');
            labelCanvas.width = 256;
            labelCanvas.height = 128;
            const labelCtx = labelCanvas.getContext('2d');
            
            // Draw background
            labelCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            labelCtx.fillRect(0, 0, 256, 128);
            
            // Draw border
            labelCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            labelCtx.lineWidth = 2;
            labelCtx.strokeRect(4, 4, 248, 120);
            
            // Draw text
            labelCtx.font = 'bold 32px Arial';
            labelCtx.textAlign = 'center';
            labelCtx.textBaseline = 'middle';
            labelCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            labelCtx.fillText(planet.name, 128, 64);
            
            const labelTexture = new THREE.CanvasTexture(labelCanvas);
            const labelMaterial = new THREE.SpriteMaterial({
                map: labelTexture,
                transparent: true,
                opacity: 0.8
            });
            
            const label = new THREE.Sprite(labelMaterial);
            // Position the label above the planet
            label.position.set(0, planet.radius * 2, 0);
            
            // Scale the label based on planet size
            const labelScale = Math.max(planet.radius * 3, 5);
            label.scale.set(labelScale, labelScale/2, 1);
            
            // Add label to mesh so it moves with the planet
            mesh.add(label);
        }
        
        // Add special indicator for dwarf planet
        if (planet.isDwarf) {
            // Add a small orbiting indicator to show dwarf planet status
            const indicatorGeometry = new THREE.SphereGeometry(planet.radius * 0.2, 16, 16);
            const indicatorMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.8
            });
            
            const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
            indicator.position.set(planet.radius * 2, planet.radius * 2, 0);
            mesh.add(indicator);
            
            // Create indicator orbit
            const curve = new THREE.EllipseCurve(
                0, 0,
                planet.radius * 2, planet.radius * 2,
                0, 2 * Math.PI,
                false,
                0
            );
            
            const points = curve.getPoints(50);
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const orbitMaterial = new THREE.LineBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.4
            });
            
            const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
            mesh.add(orbit);
            
            // Animate the indicator in the update loop
            celestialBodies.push({
                name: 'PlutoIndicator',
                mesh: indicator,
                parentMesh: mesh,
                rotationSpeed: 0.03,
                isIndicator: true,
                system: planetSystem,
                orbitSpeed: 0
            });
            
            // Add a "Dwarf Planet" label
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            context.fillStyle = '#ffff77';
            context.font = 'bold 20px Arial';
            context.fillText('Dwarf Planet', 5, 25);
            
            const labelTexture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({
                map: labelTexture,
                transparent: true
            });
            
            const dwarfLabel = new THREE.Sprite(labelMaterial);
            dwarfLabel.position.set(0, planet.radius * 1.8, 0);
            dwarfLabel.scale.set(15, 7, 1);
            mesh.add(dwarfLabel);
        }
        
        // Add label for each planet with size info
        if (planet.name !== 'Sun') {
            // Create a canvas for the label
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            context.fillStyle = '#ffffff';
            context.font = '24px Arial';
            context.fillText(planet.name, 5, 30);
            
            // Create a texture from the canvas
            const labelTexture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({
                map: labelTexture,
                transparent: true
            });
            
            const label = new THREE.Sprite(labelMaterial);
            label.position.set(0, planet.radius + 2, 0);
            label.scale.set(15, 7, 1);
            
            mesh.add(label);
        }
        
        // Add orbit path for planets (not for the sun)
        if (planet.distance > 0) {
            const orbitPath = createOrbitPath(planet.distance);
            scene.add(orbitPath);
        }
        
        // Add Saturn's rings - adjusted for new size
        if (planet.hasRings) {
            const ringGeometry = new THREE.RingGeometry(planet.radius + 3, planet.radius + 8, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xf8e9c9,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            mesh.add(ring);
        }
        
        celestialBodies.push({
            name: planet.name,
            mesh,
            system: planetSystem,
            rotationSpeed: planet.rotationSpeed,
            orbitSpeed: planet.orbitSpeed,
            isSun: planet.name === 'Sun',
            distance: planet.distance,
            radius: planet.radius  // Store the radius directly in the celestialBodies array
        });
        
        // Add button for this planet
        const button = document.createElement('button');
        button.textContent = planet.name;
        
        // Add a visual indicator for planets with moons
        const hasMoons = moonData.some(moon => moon.planetName === planet.name);
        if (hasMoons) {
            button.textContent += ' 🌙'; // Add moon emoji
            button.title = `${planet.name} (has moons)`;
        }
        
        button.addEventListener('click', () => focusOnPlanet(planet.name));
        planetButtons.appendChild(button);
    });
    
    // Create moons for planets
    createMoons();
}

// Function to create all moons in the solar system
function createMoons() {
    moonData.forEach(moon => {
        // Find the parent planet from celestialBodies
        const parentPlanet = celestialBodies.find(body => body.name === moon.planetName);
        
        if (!parentPlanet) {
            console.error(`Parent planet ${moon.planetName} not found for moon ${moon.name}`);
            return;
        }
        
        // Create moon geometry
        const moonGeometry = new THREE.SphereGeometry(moon.radius, 32, 32);
        
        // Create moon material
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: moon.color,
            roughness: 0.5,
            metalness: 0.2
        });
        
        // Load texture with the new system
        const textureUrls = TEXTURE_URLS[moon.name.toLowerCase()] || [moon.texture];
        loadTexture(moon.name, textureUrls, moonMaterial, () => {
            addDebugMessage(`Moon ${moon.name} texture loaded or fallback created`);
        });
        
        // Create moon mesh
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;
        
        // Create a container for the moon's orbit
        const moonSystem = new THREE.Object3D();
        moonSystem.position.x = parentPlanet.distance;  // Same distance from sun as parent planet
        scene.add(moonSystem);
        
        // Position moon relative to its parent planet (scaled by planet radius)
        moonMesh.position.x = parentPlanet.radius * moon.distance;
        moonSystem.add(moonMesh);
        
        // Create orbit path for moons relative to their planets
        const moonOrbitPath = createOrbitPath(parentPlanet.radius * moon.distance);
        moonOrbitPath.rotation.z = Math.random() * 0.3;  // Slight inclination for variety
        moonSystem.add(moonOrbitPath);
        
        // Add label for the moon
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 32;
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.fillText(moon.name, 5, 15);
        
        const labelTexture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({
            map: labelTexture,
            transparent: true
        });
        
        const label = new THREE.Sprite(labelMaterial);
        label.position.set(0, moon.radius + 1, 0);
        label.scale.set(5, 2, 1);
        moonMesh.add(label);
        
        // Add to celestialBodies array
        celestialBodies.push({
            name: moon.name,
            mesh: moonMesh,
            system: moonSystem,
            rotationSpeed: moon.rotationSpeed,
            orbitSpeed: moon.orbitSpeed,
            isMoon: true,
            parentPlanet: moon.planetName,
            radius: moon.radius
        });
        
        // Find the moon container for this planet, or create one if it doesn't exist
        let moonContainer = document.querySelector(`.moon-container[data-planet="${moon.planetName}"]`);
        if (!moonContainer) {
            moonContainer = document.createElement('div');
            moonContainer.className = 'moon-container';
            moonContainer.setAttribute('data-planet', moon.planetName);
            moonContainer.style.display = 'none'; // Initially hidden
            
            // Add to the body instead of inside the controls panel
            document.body.appendChild(moonContainer);
            
            // Make the container draggable to allow user to reposition it
            makeDraggable(moonContainer);
        }
        
        // Add button for this moon in the moon container
        const moonButton = document.createElement('button');
        moonButton.textContent = moon.name;
        moonButton.classList.add('moon-button');
        moonButton.title = `Moon of ${moon.planetName}`;
        
        // Add planet icon next to moon name
        const planetIconsMap = {
            'Earth': '🌎',
            'Mars': '🔴',
            'Jupiter': '🪐',
            'Saturn': '💫',
            'Uranus': '⚪',
            'Neptune': '🔵'
        };
        
        const planetIcon = planetIconsMap[moon.planetName] || '🪐';
        moonButton.innerHTML = `${moon.name} <small>${planetIcon}</small>`;
        
        moonButton.addEventListener('click', () => focusOnPlanet(moon.name));
        moonContainer.appendChild(moonButton);
    });
    
    // Make all containers draggable
    makeAllMoonContainersDraggable();
}

// Function to make all existing moon containers draggable
function makeAllMoonContainersDraggable() {
    const moonContainers = document.querySelectorAll('.moon-container');
    moonContainers.forEach(container => {
        makeDraggable(container);
    });
}

// Add a tracking variable to store the planet being followed
let trackingPlanet = null;

// Function to focus on a specific planet
function focusOnPlanet(planetName) {
    addDebugMessage(`Focusing on planet: ${planetName}`);
    const planet = celestialBodies.find(body => body.name === planetName);
    
    if (!planet) {
        addDebugMessage(`❌ Planet not found: ${planetName}`);
        return;
    }
    
    // Set this planet as the tracking target
    trackingPlanet = planet;
    addDebugMessage(`Now tracking: ${planetName}`);
    
    // Show the stop tracking button
    stopTrackingBtn.style.display = 'block';
    
    // Get the world position of the planet
    const targetPosition = new THREE.Vector3();
    
    // Make sure the world matrix is updated before getting the position
    if (planet.system) planet.system.updateMatrixWorld(true);
    if (planet.mesh) planet.mesh.updateMatrixWorld(true);
    
    planet.mesh.getWorldPosition(targetPosition);
    
    addDebugMessage(`Target position: ${targetPosition.x.toFixed(2)}, ${targetPosition.y.toFixed(2)}, ${targetPosition.z.toFixed(2)}`);
    
    // Calculate proper offset based on the planet
    const planetRadius = planet.radius || (planet.mesh.geometry.parameters ? planet.mesh.geometry.parameters.radius : 10);
    const viewingDistance = planet.isSun ? 100 : Math.max(planetRadius * 10, 30);
    
    addDebugMessage(`Using viewing distance: ${viewingDistance}, radius: ${planetRadius}`);
    
    // Position camera at a proper distance from the planet
    const cameraPosition = new THREE.Vector3(
        targetPosition.x + viewingDistance,
        targetPosition.y + viewingDistance * 0.3,
        targetPosition.z + viewingDistance * 0.3
    );
    
    addDebugMessage(`Moving camera to: ${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(2)}`);
    
    // Use a simpler, more robust approach
    // Directly update the camera and controls to avoid animation problems
    camera.position.copy(cameraPosition);
    controls.target.copy(targetPosition);
    controls.update();
    
    addDebugMessage(`Camera position set: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`);
    addDebugMessage(`Looking at: ${controls.target.x.toFixed(2)}, ${controls.target.y.toFixed(2)}, ${controls.target.z.toFixed(2)}`);
    
    // Remove any existing popup
    const existingPopup = document.getElementById('planet-info');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Show planet info popup
    showPlanetInfo(planetName);
    
    // Handle moon containers
    if (planet.isMoon) {
        // If focusing on a moon, show the parent planet's moon container
        const parentPlanet = planet.parentPlanet;
        showMoonContainer(parentPlanet);
    } else {
        // If focusing on a planet, show/hide moon containers appropriately
        const allMoonContainers = document.querySelectorAll('.moon-container');
        allMoonContainers.forEach(container => {
            if (container.getAttribute('data-planet') === planetName) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
        
        // Add a back button if it doesn't exist and we're showing moons
        const moonContainer = document.querySelector(`.moon-container[data-planet="${planetName}"]`);
        if (moonContainer) {
            let backButton = moonContainer.querySelector('.back-button');
            if (!backButton) {
                backButton = document.createElement('button');
                backButton.textContent = '← Back to Planets';
                backButton.className = 'back-button';
                backButton.addEventListener('click', (event) => {
                    // Prevent the click from reaching the parent container
                    event.stopPropagation();
                    
                    // Hide all moon containers
                    const allMoonContainers = document.querySelectorAll('.moon-container');
                    allMoonContainers.forEach(container => {
                        container.style.display = 'none';
                    });
                    
                    // Reset camera to a position showing all planets
                    camera.position.set(0, 500, 1500);
                    controls.target.set(0, 0, 0);
                    controls.update();
                    
                    // Stop tracking
                    trackingPlanet = null;
                    stopTrackingBtn.style.display = 'none';
                });
                moonContainer.insertBefore(backButton, moonContainer.firstChild);
            }
        }
    }
}

// Helper function to show a specific moon container
function showMoonContainer(planetName) {
    if (!planetName) return;
    
    // Hide all moon containers first
    const allMoonContainers = document.querySelectorAll('.moon-container');
    allMoonContainers.forEach(container => {
        container.style.display = 'none';
    });
    
    // Show the container for this planet
    const moonContainer = document.querySelector(`.moon-container[data-planet="${planetName}"]`);
    if (moonContainer) {
        // Set display to flex for proper layout
        moonContainer.style.display = 'flex';
        
        // Ensure the container is positioned properly
        if (!moonContainer.style.top || !moonContainer.style.left) {
            moonContainer.style.top = '240px';
            moonContainer.style.left = '30px';
        }
        
        // Make sure it's draggable
        makeDraggable(moonContainer);
        
        // If too many moons, add scrolling
        if (moonContainer.querySelectorAll('.moon-button').length > 8) {
            moonContainer.style.flexDirection = 'column';
            moonContainer.style.alignItems = 'center';
            moonContainer.style.maxHeight = '300px';
            moonContainer.style.overflowY = 'auto';
        } else {
            moonContainer.style.flexDirection = 'row';
            moonContainer.style.flexWrap = 'wrap';
        }
    }
}

// Function to show information about the selected planet
function showPlanetInfo(planetName) {
    try {
        // Planet information content
        const planetInfo = {
            'Sun': {
                title: 'The Sun',
                color: '#ffdd00',
                facts: [
                    'Center of our solar system',
                    'A G-type main-sequence star (G2V)',
                    'Diameter: 1,392,684 km (109 times Earth)',
                    'Surface temperature: ~5,500°C (9,940°F)',
                    'Core temperature: ~15,000,000°C',
                    'Contains 99.86% of the solar system\'s mass',
                    'Age: about 4.6 billion years'
                ]
            },
            'Mercury': {
                title: 'Mercury',
                color: '#bbbbbb',
                facts: [
                    'Closest planet to the Sun',
                    'Smallest planet in our solar system',
                    'No atmosphere to retain heat (extreme temperature variations)',
                    'Daytime temperature: up to 430°C (800°F)',
                    'Nighttime temperature: down to -180°C (-290°F)',
                    'One day on Mercury equals 59 Earth days',
                    'Heavily cratered surface similar to our Moon'
                ]
            },
            'Venus': {
                title: 'Venus',
                color: '#fff1c9',
                facts: [
                    'Often called Earth\'s "sister planet" due to similar size',
                    'Rotates backward compared to other planets',
                    'Thickest atmosphere of all terrestrial planets',
                    'Surface temperature: ~462°C (864°F) - hot enough to melt lead',
                    'Atmosphere is 96% carbon dioxide (extreme greenhouse effect)',
                    'Surface pressure is 92 times that of Earth',
                    'Named after the Roman goddess of love and beauty'
                ]
            },
            'Earth': {
                title: 'Earth',
                color: '#2d9bf0',
                facts: [
                    'Only known planet to support life',
                    'About 71% of surface is covered in water',
                    'Has one natural satellite - the Moon',
                    'Only planet with active plate tectonics',
                    'Strong magnetic field protects from solar radiation',
                    'Atmosphere composed mainly of nitrogen (78%) and oxygen (21%)',
                    'Average distance from Sun: 149.6 million km (1 AU)'
                ]
            },
            'Mars': {
                title: 'Mars',
                color: '#ff5500',
                facts: [
                    'Known as the "Red Planet" due to iron oxide (rust) on its surface',
                    'Has two small moons: Phobos and Deimos',
                    'Features the largest volcano in the solar system: Olympus Mons',
                    'Features the largest canyon: Valles Marineris (4,000 km long)',
                    'Has seasonal ice caps made of CO₂ and water ice',
                    'Evidence suggests it once had flowing water on its surface',
                    'Target for human exploration missions'
                ]
            },
            'Jupiter': {
                title: 'Jupiter',
                color: '#f0c384',
                facts: [
                    'Largest planet in our solar system',
                    'A gas giant composed mainly of hydrogen and helium',
                    'Has the Great Red Spot - a storm that has lasted over 300 years',
                    'More than twice as massive as all other planets combined',
                    'Has at least 79 moons, with four large ones discovered by Galileo',
                    'Has a faint ring system',
                    'Strong magnetic field traps dangerous radiation'
                ]
            },
            'Saturn': {
                title: 'Saturn',
                color: '#f7e9b9',
                facts: [
                    'Second largest planet in our solar system',
                    'Famous for its spectacular ring system extending up to 282,000 km',
                    'Rings are made mostly of ice particles with some rocky debris',
                    'Lowest density of all planets - would float in water',
                    'Has at least 82 moons, including Titan, which has a thick atmosphere',
                    'Named after the Roman god of wealth and agriculture',
                    'Average distance from Sun: 1.4 billion km (9.5 AU)'
                ]
            },
            'Uranus': {
                title: 'Uranus',
                color: '#9df5ff',
                facts: [
                    'First planet discovered using a telescope (by William Herschel in 1781)',
                    'Rotates on its side with an axial tilt of 98 degrees',
                    'Appears blue-green due to methane in its atmosphere',
                    'Has 13 known rings and 27 known moons',
                    'Coldest planetary atmosphere in the solar system (-224°C)',
                    'Classified as an "ice giant" rather than a gas giant',
                    'Only visited by one spacecraft (Voyager 2 in 1986)'
                ]
            },
            'Neptune': {
                title: 'Neptune',
                color: '#5580ff',
                facts: [
                    'Farthest planet from the Sun (since Pluto\'s reclassification)',
                    'Discovered through mathematical predictions rather than observation',
                    'Strongest winds in the solar system (up to 2,100 km/h)',
                    'Has 14 known moons, the largest being Triton',
                    'Has a dark storm similar to Jupiter\'s Great Red Spot',
                    'Composed primarily of ice and rock with hydrogen and helium atmosphere',
                    'Completes one orbit around the Sun every 165 Earth years'
                ]
            },
            'Pluto': {
                title: 'Pluto: The Dwarf Planet',
                color: '#ffff77',
                facts: [
                    'Reclassified as a "dwarf planet" by the IAU in 2006',
                    'Only 18% the size of Earth',
                    'Located about 39.5 AU from the Sun',
                    'Has 5 known moons, including Charon',
                    'Has a highly elliptical orbit',
                    'Takes 248 Earth years to orbit the Sun',
                    'Studied up close by NASA\'s New Horizons mission in 2015'
                ]
            },
            'Moon': {
                title: 'Earth\'s Moon',
                color: '#ffffff',
                facts: [
                    'Earth\'s only natural satellite',
                    'Fifth largest moon in the solar system',
                    'Distance from Earth: about 384,400 km',
                    'Formed about 4.5 billion years ago, likely from a massive collision',
                    'Has no atmosphere or magnetic field',
                    'Surface covered in regolith (fine dust and rock fragments)',
                    'Only celestial body besides Earth visited by humans'
                ]
            },
            'Phobos': {
                title: 'Phobos: Mars\' Moon',
                color: '#888888',
                facts: [
                    'Larger of Mars\' two moons (22.2 km diameter)',
                    'Orbits extremely close to Mars (9,377 km from surface)',
                    'Completes an orbit in just 7 hours and 39 minutes',
                    'Moving closer to Mars by about 2 meters every century',
                    'Expected to crash into Mars or break apart in 30-50 million years',
                    'Heavily cratered with a large impact crater called Stickney',
                    'Likely a captured asteroid'
                ]
            },
            'Deimos': {
                title: 'Deimos: Mars\' Moon',
                color: '#777777',
                facts: [
                    'Smaller of Mars\' two moons (12.4 km diameter)',
                    'Orbits further from Mars than Phobos (23,460 km)',
                    'Completes an orbit in 30.3 hours',
                    'Named after the Greek god of dread',
                    'Smoother surface than Phobos with fewer craters',
                    'Likely a captured asteroid',
                    'Discovered in 1877 by Asaph Hall'
                ]
            },
            'Io': {
                title: 'Io: Jupiter\'s Volcanic Moon',
                color: '#fff499',
                facts: [
                    'Most volcanically active body in the solar system',
                    'Over 400 active volcanoes',
                    'Surface constantly renewed by lava flows',
                    'Sulfur compounds give it a yellow-orange-red appearance',
                    'Caught in gravitational tug-of-war between Jupiter and other moons',
                    'Tidal forces generate intense internal heat',
                    'Discovered by Galileo Galilei in 1610'
                ]
            },
            'Europa': {
                title: 'Europa: Jupiter\'s Ocean Moon',
                color: '#ccccbb',
                facts: [
                    'Smooth, icy surface with very few craters',
                    'Global subsurface ocean of liquid water',
                    'Considered one of the best places to search for extraterrestrial life',
                    'Crisscrossed by a network of linear features called lineae',
                    'Ice shell estimated to be 10-30 km thick',
                    'Ocean may contain more water than all of Earth\'s oceans combined',
                    'Target for NASA\'s Europa Clipper mission'
                ]
            },
            'Ganymede': {
                title: 'Ganymede: Jupiter\'s Largest Moon',
                color: '#aabbcc',
                facts: [
                    'Largest moon in the solar system (larger than Mercury)',
                    'Only moon known to generate its own magnetic field',
                    'Surface divided into dark, cratered regions and lighter, grooved terrain',
                    'Contains a subsurface ocean of liquid water',
                    'Named after a cupbearer to the Greek gods',
                    'Composed of approximately equal amounts of silicate rock and water ice',
                    'Discovered by Galileo Galilei in 1610'
                ]
            },
            'Callisto': {
                title: 'Callisto: Jupiter\'s Cratered Moon',
                color: '#888899',
                facts: [
                    'Most heavily cratered object in the solar system',
                    'Surface is extremely old - about 4 billion years',
                    'Outermost of Jupiter\'s four large Galilean moons',
                    'May contain a subsurface ocean',
                    'Very little internal geological activity',
                    'Named after a nymph in Greek mythology',
                    'Discovered by Galileo Galilei in 1610'
                ]
            },
            'Titan': {
                title: 'Titan: Saturn\'s Largest Moon',
                color: '#ffbb66',
                facts: [
                    'Only moon with a dense atmosphere (mostly nitrogen)',
                    'Only place besides Earth with stable liquid on its surface',
                    'Lakes and seas of liquid methane and ethane',
                    'Surface pressure 1.5 times that of Earth',
                    'Surface temperature around -179°C (-290°F)',
                    'Studied by the Cassini-Huygens mission which landed a probe in 2005',
                    'Potential for exotic forms of life'
                ]
            },
            'Titania': {
                title: 'Titania: Uranus\' Largest Moon',
                color: '#dddddd',
                facts: [
                    'Largest moon of Uranus',
                    'Named after the queen of the fairies in Shakespeare\'s "A Midsummer Night\'s Dream"',
                    'Surface shows evidence of geological activity',
                    'Features large canyons formed by tectonic processes',
                    'Composed of roughly equal amounts of ice and rock',
                    'Discovered by William Herschel in 1787',
                    'Only visited once by Voyager 2 in 1986'
                ]
            },
            'Oberon': {
                title: 'Oberon: Uranus\' Distant Moon',
                color: '#cccccc',
                facts: [
                    'Second largest and outermost major moon of Uranus',
                    'Named after the king of the fairies in Shakespeare\'s "A Midsummer Night\'s Dream"',
                    'Heavily cratered surface with some large impact basins',
                    'Dark material on crater floors may be organic-rich material',
                    'Composed of ice and rock',
                    'Discovered by William Herschel in 1787',
                    'Only visited once by Voyager 2 in 1986'
                ]
            },
            'Triton': {
                title: 'Triton: Neptune\'s Largest Moon',
                color: '#ffddcc',
                facts: [
                    'Only large moon in the solar system with a retrograde orbit',
                    'Likely a captured dwarf planet from the Kuiper Belt',
                    'Active geology with nitrogen geysers and cryovolcanism',
                    'Surface temperature of -235°C (-391°F) - one of the coldest in the solar system',
                    'Thin nitrogen atmosphere with seasonal changes',
                    'Cantaloupe terrain unique in the solar system',
                    'Will eventually spiral into Neptune or break apart due to tidal forces'
                ]
            },
            // New moon information
            'Enceladus': {
                title: 'Enceladus: Saturn\'s Active Moon',
                color: '#ffffff',
                facts: [
                    'Reflects almost 100% of the sunlight that hits it',
                    'Features active geysers that spray water into space',
                    'Has a subsurface ocean of liquid water beneath its icy crust',
                    'One of the most promising places to search for extraterrestrial life',
                    'Surface temperature around -198°C (-324°F)',
                    'Only 504 km (313 miles) in diameter',
                    'Material from its geysers forms Saturn\'s E ring'
                ]
            },
            'Mimas': {
                title: 'Mimas: Saturn\'s Death Star Moon',
                color: '#dddddd',
                facts: [
                    'Features a large impact crater (Herschel) that gives it a resemblance to the Death Star',
                    'One of the most heavily cratered bodies in the solar system',
                    'Only 396 km (246 miles) in diameter',
                    'Orbital resonance with nearby moons creates waves in Saturn\'s rings',
                    'Has an unusual wobble suggesting either a subsurface ocean or irregularly shaped core',
                    'Discovered in 1789 by William Herschel',
                    'Sometimes called "Saturn\'s smallest major moon"'
                ]
            },
            'Rhea': {
                title: 'Rhea: Saturn\'s Second-Largest Moon',
                color: '#cccccc',
                facts: [
                    'Second-largest moon of Saturn (1,528 km diameter)',
                    'Heavily cratered surface with bright wispy streaks',
                    'Composed mostly of water ice with a small rocky core',
                    'May have a tenuous oxygen-carbon dioxide atmosphere',
                    'Named after a Titan in Greek mythology',
                    'Discovered in 1672 by Giovanni Cassini',
                    'Surface gravity is about 1/20th that of Earth'
                ]
            },
            'Iapetus': {
                title: 'Iapetus: Saturn\'s Two-Faced Moon',
                color: '#aaaaaa',
                facts: [
                    'Features a striking two-toned appearance with dark and light hemispheres',
                    'Has a mysterious equatorial ridge that makes it look like a walnut',
                    'Third-largest moon of Saturn (1,469 km diameter)',
                    'Orbits much farther from Saturn than other large moons',
                    'Dark material likely originated from dust from Phoebe, another Saturn moon',
                    'Surface temperature varies dramatically between hemispheres',
                    'Discovered in 1671 by Giovanni Cassini'
                ]
            },
            'Miranda': {
                title: 'Miranda: Uranus\' Frankenstein Moon',
                color: '#cccccc',
                facts: [
                    'Features an unusually varied and jumbled surface terrain',
                    'Has the tallest cliff in the solar system (up to 20 km high)',
                    'Smallest of Uranus\' five major moons (472 km diameter)',
                    'Extreme terrain suggests it was shattered and reassembled multiple times',
                    'Discovered in 1948 by Gerard Kuiper',
                    'Named after a character in Shakespeare\'s "The Tempest"',
                    'Only imaged up close by Voyager 2 in 1986'
                ]
            },
            'Ariel': {
                title: 'Ariel: Uranus\' Bright Moon',
                color: '#dddddd',
                facts: [
                    'Brightest and possibly youngest-surfaced of Uranus\' moons',
                    'Features extensive valleys and relatively few impact craters',
                    'Fourth-largest moon of Uranus (1,158 km diameter)',
                    'Surface shows signs of relatively recent geological activity',
                    'Composed of roughly equal parts water ice and silicate rock',
                    'Named after a spirit in Shakespeare\'s "The Tempest"',
                    'Only imaged up close by Voyager 2 in 1986'
                ]
            },
            'Umbriel': {
                title: 'Umbriel: Uranus\' Dark Moon',
                color: '#888888',
                facts: [
                    'Darkest of Uranus\' five major moons, reflecting only 16% of sunlight',
                    'Surface appears ancient and heavily cratered',
                    'Features a mysterious bright ring-shaped feature called the "fluorescent cheerio"',
                    'Third-largest moon of Uranus (1,169 km diameter)',
                    'Named after a character in Alexander Pope\'s "The Rape of the Lock"',
                    'Discovered in 1851 by William Lassell',
                    'Only imaged up close by Voyager 2 in 1986'
                ]
            },
            'Proteus': {
                title: 'Proteus: Neptune\'s Second-Largest Moon',
                color: '#888888',
                facts: [
                    'Second-largest moon of Neptune (420 km diameter)',
                    'Not discovered until the Voyager 2 flyby in 1989',
                    'Irregularly shaped and heavily cratered',
                    'Features one of the largest impact craters relative to body size in the solar system',
                    'May be close to the maximum size for an irregular-shaped object',
                    'Orbits close to Neptune, inside the orbit of Triton',
                    'Named after the shape-changing sea god from Greek mythology'
                ]
            },
            'Nereid': {
                title: 'Nereid: Neptune\'s Peculiar Moon',
                color: '#aaaaaa',
                facts: [
                    'Third-largest moon of Neptune (340 km diameter)',
                    'Has one of the most eccentric orbits of any moon in the solar system',
                    'Distance from Neptune varies from 1.4 million to 9.7 million km',
                    'Takes 360 Earth days to orbit Neptune',
                    'Possibly a captured object or disturbed by Triton\'s capture',
                    'Discovered in 1949 by Gerard Kuiper',
                    'Named after the sea nymphs of Greek mythology'
                ]
            }
        };
        
        // Get the info for the current planet
        const info = planetInfo[planetName];
        if (!info) {
            addDebugMessage(`No information available for ${planetName}`);
            return;
        }
        
        // Create popup
        const infoPopup = document.createElement('div');
        infoPopup.id = 'planet-info';
        infoPopup.style.position = 'absolute';
        infoPopup.style.top = '50%';
        infoPopup.style.left = '50%';
        infoPopup.style.transform = 'translate(-50%, -50%)';
        infoPopup.style.color = 'white';
        infoPopup.style.background = 'rgba(0,0,0,0.8)';
        infoPopup.style.padding = '20px';
        infoPopup.style.borderRadius = '10px';
        infoPopup.style.fontFamily = 'Arial, sans-serif';
        infoPopup.style.zIndex = '2000';
        infoPopup.style.maxWidth = '400px';
        infoPopup.style.boxShadow = `0 0 20px ${info.color}`;
        infoPopup.style.border = `1px solid ${info.color}`;
        
        // Create the HTML content
        let factsHTML = '';
        info.facts.forEach(fact => {
            factsHTML += `<li>${fact}</li>`;
        });
        
        infoPopup.innerHTML = `
            <h2 style="color: ${info.color}; margin-top: 0;">${info.title}</h2>
            <ul style="padding-left: 20px; margin-bottom: 20px;">
                ${factsHTML}
            </ul>
            <button id="close-planet-info" style="background: ${info.color}; color: black; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; display: block; margin: 0 auto;">Close</button>
        `;
        
        document.body.appendChild(infoPopup);
        
        // Add close button event listener
        const closeBtn = document.getElementById('close-planet-info');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const popup = document.getElementById('planet-info');
                if (popup) popup.remove();
            });
        }
        
        // Auto-close popup after 30 seconds
        setTimeout(() => {
            const popup = document.getElementById('planet-info');
            if (popup) popup.remove();
        }, 30000);
        
    } catch (e) {
        console.error("Error creating planet info popup:", e);
        addDebugMessage(`Error with planet info popup: ${e.message}`);
    }
}

// Setup control buttons
document.getElementById('overview').addEventListener('click', () => {
    try {
        // Stop tracking any planet
        trackingPlanet = null;
        
        // Log the action
        if (typeof addDebugMessage === 'function') {
            addDebugMessage(`Overview view activated, planet tracking stopped`);
        }
        
        // Hide stop tracking button if it exists
        if (typeof stopTrackingBtn !== 'undefined' && stopTrackingBtn) {
            stopTrackingBtn.style.display = 'none';
        }
        
        // Hide all moon containers if the function exists
        if (typeof hideAllMoonContainers === 'function') {
            hideAllMoonContainers();
        }
        
        // Move camera to a distant position to see the entire solar system
        camera.position.set(0, 3000, 6000);
        controls.target.set(0, 0, 0);
        controls.update();
        
        console.log("Overview view activated");
    } catch (error) {
        console.error("Error in overview button handler:", error);
    }
});

document.getElementById('reset').addEventListener('click', () => {
    try {
        // Stop tracking any planet
        trackingPlanet = null;
        
        // Log the action
        if (typeof addDebugMessage === 'function') {
            addDebugMessage(`View reset, planet tracking stopped`);
        }
        
        // Hide stop tracking button if it exists
        if (typeof stopTrackingBtn !== 'undefined' && stopTrackingBtn) {
            stopTrackingBtn.style.display = 'none';
        }
        
        // Hide all moon containers if the function exists
        if (typeof hideAllMoonContainers === 'function') {
            hideAllMoonContainers();
        }
        
        // Reset camera to default position
        camera.position.set(0, 500, 1500);
        controls.target.set(0, 0, 0);
        controls.update();
        
        console.log("View reset to default position");
    } catch (error) {
        console.error("Error in reset button handler:", error);
    }
});

document.getElementById('top-view').addEventListener('click', () => {
    try {
        // Stop tracking any planet
        trackingPlanet = null;
        
        // Log the action
        if (typeof addDebugMessage === 'function') {
            addDebugMessage(`Top view activated, planet tracking stopped`);
        }
        
        // Hide stop tracking button if it exists
        if (typeof stopTrackingBtn !== 'undefined' && stopTrackingBtn) {
            stopTrackingBtn.style.display = 'none';
        }
        
        // Hide all moon containers if the function exists
        if (typeof hideAllMoonContainers === 'function') {
            hideAllMoonContainers();
        }
        
        // Move camera high above the solar system looking down
        camera.position.set(0, 5000, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        
        console.log("Top view activated");
    } catch (error) {
        console.error("Error in top-view button handler:", error);
    }
});

document.getElementById('sun-view').addEventListener('click', () => {
    try {
        // Stop tracking any planet
        trackingPlanet = null;
        
        // Log the action
        if (typeof addDebugMessage === 'function') {
            addDebugMessage(`Sun view activated, planet tracking stopped`);
        }
        
        // Hide stop tracking button if it exists
        if (typeof stopTrackingBtn !== 'undefined' && stopTrackingBtn) {
            stopTrackingBtn.style.display = 'none';
        }
        
        // Hide all moon containers if the function exists
        if (typeof hideAllMoonContainers === 'function') {
            hideAllMoonContainers();
        }
        
        // Move camera close to the sun
        camera.position.set(100, 50, 100);
        controls.target.set(0, 0, 0);
        controls.update();
        
        console.log("Sun view activated");
    } catch (error) {
        console.error("Error in sun-view button handler:", error);
    }
});

// Helper function to hide all moon containers
function hideAllMoonContainers() {
    const allMoonContainers = document.querySelectorAll('.moon-container');
    allMoonContainers.forEach(container => {
        container.style.display = 'none';
    });
}

// Add distance markers for reference
function createDistanceMarkers() {
    // Create markers at each AU distance
    for (let au = 1; au <= 40; au += au < 5 ? 1 : 5) {
        const radius = au * 150;
        const curve = new THREE.EllipseCurve(
            0, 0,                  // Center
            radius, radius,        // X and Y radius
            0, 2 * Math.PI,        // Start and end angle
            false,                 // Clockwise
            0                      // Rotation
        );
        
        const points = curve.getPoints(128);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });
        
        const ellipse = new THREE.Line(geometry, material);
        ellipse.rotation.x = Math.PI / 2;
        scene.add(ellipse);
        
        // Add text label for the marker
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 32;
        context.fillStyle = '#aaaaaa';
        context.font = '24px Arial';
        context.fillText(`${au} AU`, 5, 24);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        const label = new THREE.Sprite(labelMaterial);
        label.position.set(radius, 0, 0);
        label.scale.set(50, 15, 1);
        scene.add(label);
    }
}

createStars();
createPlanets();
createDistanceMarkers();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    try {
        const time = Date.now() * 0.001;
        const deltaTime = 1/60; // Approximate for smooth animation
        
        // Run initial animation if not complete
        if (!initialAnimationComplete) {
            performInitialAnimation(deltaTime);
        }
        
        // Update planets
        celestialBodies.forEach(body => {
            try {
                // Self rotation
                if (body.mesh) body.mesh.rotation.y += body.rotationSpeed;
                
                // Orbit around the sun
                if (!body.isSun && body.system) {
                    body.system.rotation.y += body.orbitSpeed;
                    
                    // Update the world matrix to ensure getWorldPosition works correctly
                    if (body.mesh) {
                        body.mesh.updateMatrixWorld();
                    }
                    
                    // Update moon orbit
                    if (body.moons) {
                        body.moons.forEach(moon => {
                            if (moon.system) {
                                moon.system.rotation.y += moon.orbitSpeed * 10;
                            }
                        });
                    }
                }
            } catch (e) {
                console.error(`Error updating celestial body: ${e.message}`);
            }
        });
        
        // Update camera position when tracking a planet
        if (trackingPlanet && trackingPlanet.mesh) {
            // Get the current world position of the tracked planet
            const targetPosition = new THREE.Vector3();
            
            // Make sure world matrix is updated
            if (trackingPlanet.system) trackingPlanet.system.updateMatrixWorld(true);
            trackingPlanet.mesh.updateMatrixWorld(true);
            trackingPlanet.mesh.getWorldPosition(targetPosition);
            
            // Calculate proper viewing distance
            const planetRadius = trackingPlanet.radius || 
                (trackingPlanet.mesh.geometry.parameters ? 
                 trackingPlanet.mesh.geometry.parameters.radius : 10);
            const viewingDistance = trackingPlanet.isSun ? 100 : Math.max(planetRadius * 10, 30);
            
            // Update the camera target to follow the planet
            controls.target.copy(targetPosition);
            
            // Position camera at a proper distance from the planet
            // Use a smooth camera movement to make tracking more pleasant
            const idealCameraPosition = new THREE.Vector3(
                targetPosition.x + viewingDistance,
                targetPosition.y + viewingDistance * 0.3,
                targetPosition.z + viewingDistance * 0.3
            );
            
            // Smoothly interpolate to the ideal position (uncomment for smoother motion)
            // camera.position.lerp(idealCameraPosition, 0.05);
            
            // For direct tracking without smoothing, use this:
            camera.position.copy(idealCameraPosition);
        }
        
        // Update twinkling stars
        if (window.twinklingStars) {
            // Make the stars twinkle by varying their opacity based on time
            const opacity = 0.6 + Math.sin(time * 2) * 0.4;
            window.twinklingStars.material.opacity = opacity;
            
            // Slightly vary the size of the stars
            const size = 2.5 + Math.sin(time * 3) * 0.5;
            window.twinklingStars.material.size = size;
            
            // Create a subtle pulsing effect by scaling the entire group
            const scale = 1 + Math.sin(time) * 0.03;
            window.twinklingStars.scale.set(scale, scale, scale);
        }
        
        // Update controls if enabled
        if (controls.enabled) {
                controls.update();
        }
        
        renderer.render(scene, camera);
    } catch (e) {
        console.error(`Error in animation loop: ${e.message}`);
    }
}

// Function to reset the scene if something goes wrong
function resetScene() {
    try {
        // Stop tracking any planet
        trackingPlanet = null;
        addDebugMessage(`Planet tracking stopped due to reset`);
        stopTrackingBtn.style.display = 'none';
        
        // Hide all moon containers
        hideAllMoonContainers();
        
        // Reset camera to a safe position
        camera.position.set(0, 500, 1500);
        controls.target.set(0, 0, 0);
        controls.update();
        
        // Hide any popups that might be causing issues
        const plutoInfo = document.getElementById('pluto-info');
        if (plutoInfo) plutoInfo.remove();
        
        const planetInfo = document.getElementById('planet-info');
        if (planetInfo) planetInfo.remove();
        
        // Force loading screen to hide if it's still showing
        document.getElementById('loading').style.display = 'none';
        
        addDebugMessage("Scene reset attempted");
    } catch (e) {
        console.error("Failed to reset scene:", e);
    }
}

// Add Stop Tracking button to the interface
const stopTrackingBtn = document.createElement('button');
stopTrackingBtn.id = 'stop-tracking';
stopTrackingBtn.textContent = 'Stop Tracking';
stopTrackingBtn.style.position = 'absolute';
stopTrackingBtn.style.top = '10px';
stopTrackingBtn.style.right = '20px';
stopTrackingBtn.style.zIndex = '1001';
stopTrackingBtn.style.background = 'rgba(255,50,50,0.7)';
stopTrackingBtn.style.color = 'white';
stopTrackingBtn.style.border = '1px solid #555';
stopTrackingBtn.style.borderRadius = '4px';
stopTrackingBtn.style.padding = '5px 10px';
stopTrackingBtn.style.fontSize = '12px';
stopTrackingBtn.style.cursor = 'pointer';
stopTrackingBtn.style.display = 'none'; // Initially hidden
document.body.appendChild(stopTrackingBtn);

// Stop tracking button click handler
stopTrackingBtn.addEventListener('click', () => {
    trackingPlanet = null;
    addDebugMessage(`Planet tracking manually stopped`);
    stopTrackingBtn.style.display = 'none';
    
    // Hide all moon containers
    hideAllMoonContainers();
});

animate(); 

// Function to show notifications in the UI
function showNotification(message, type = 'info') {
    // Create or get the notification container
    let notificationArea = document.getElementById('notification-area');
    
    if (!notificationArea) {
        notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        notificationArea.style.position = 'fixed';
        notificationArea.style.top = '20px';
        notificationArea.style.right = '20px';
        notificationArea.style.maxWidth = '300px';
        notificationArea.style.zIndex = '2000';
        document.body.appendChild(notificationArea);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div class="notification-content">${message}</div>`;
    
    // Style based on type
    const colors = {
        info: {bg: '#3498db', text: 'white'},
        warning: {bg: '#f39c12', text: 'black'},
        error: {bg: '#e74c3c', text: 'white'},
        success: {bg: '#2ecc71', text: 'white'}
    };
    
    const style = colors[type] || colors.info;
    
    notification.style.backgroundColor = style.bg;
    notification.style.color = style.text;
    notification.style.padding = '10px 15px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'transform 0.3s ease-out';
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = () => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };
    notification.appendChild(closeBtn);
    
    // Add to container
    notificationArea.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 6000);
}

// Function to make an element draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // Add a draggable header to the element if it doesn't have one already
    let header = element.querySelector('.drag-handle');
    
    if (!header) {
        header = document.createElement('div');
        header.className = 'drag-handle';
        header.innerHTML = '<div style="width: 100%; text-align: center; user-select: none;">⋮⋮ Drag Me ⋮⋮</div>';
        header.style.cursor = 'move';
        header.style.padding = '8px 0';
        header.style.marginBottom = '10px';
        header.style.backgroundColor = 'rgba(20, 30, 50, 0.8)';
        header.style.borderRadius = '5px 5px 0 0';
        header.style.borderBottom = '2px solid rgba(52, 152, 219, 0.6)';
        header.style.color = '#3498db';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '12px';
        header.style.textTransform = 'uppercase';
        header.style.letterSpacing = '1px';
        element.insertBefore(header, element.firstChild);
        
        // Create a close button
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '8px';
        closeBtn.style.right = '10px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.color = '#e74c3c';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.zIndex = '101';
        closeBtn.onclick = function(e) {
            e.stopPropagation();
            element.style.display = 'none';
        };
        element.appendChild(closeBtn);
    }
    
    // Make sure the draggable element has position absolute
    if (window.getComputedStyle(element).position !== 'absolute') {
        element.style.position = 'absolute';
    }
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Change opacity to show dragging state
        element.style.opacity = '0.9';
        element.style.boxShadow = '0 10px 30px rgba(52, 152, 219, 0.6)';
        element.style.cursor = 'grabbing';
        
        if (header) {
            header.style.backgroundColor = 'rgba(52, 152, 219, 0.4)';
        }
        
        // Set z-index higher to ensure it stays on top during drag
        element.style.zIndex = '1000';
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Restore opacity
        element.style.opacity = '1';
        element.style.boxShadow = '';
        element.style.cursor = '';
        
        if (header) {
            header.style.backgroundColor = 'rgba(20, 30, 50, 0.8)';
        }
        
        // Restore user select
        document.body.style.userSelect = '';
    }
}