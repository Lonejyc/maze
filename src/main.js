import { Scene, Color, PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, 
    PointLight, PCFSoftShadowMap, PMREMGenerator, TextureLoader, RepeatWrapping } from 'https://cdn.skypack.dev/three@0.137';
import { OrbitControls } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';
import { RGBELoader } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader';

import { setupScene, setupCamera, setupRenderer, setupLights, setupControls } from './scene.js';
import { generateMaze, validateMaze } from './maze.js';
import { aStarPathfinding } from './pathfinding.js';
import { createHex, colorHex } from './hexagons.js';
import { tileToPosition } from './utils.js';

// Constants
export const MAX_HEIGHT = 5;
export const ISLAND_RADIUS = 32;
export const TILE_SIZE = 1.77;
export const MAZE_SIZE = 20;

// Colors for pathfinding
export const SOLUTION_COLOR = new Color("#00CC00"); // Green = final path
export const DEFAULT_COLOR = new Color("#FFFF00"); // Yellow = all other tiles

// Global variables
export let scene, camera, renderer, controls, light, pmrem, envmap;
export const hexMeshes = new Map();

// Initialize the application
(async function init() {
// Setup three.js scene
scene = setupScene();
camera = setupCamera();
renderer = setupRenderer();
controls = setupControls(camera, renderer);
light = setupLights(scene);

// Setup PMREM generator for environment mapping
pmrem = new PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

// Load environment map
let envmapTexture = await new RGBELoader().loadAsync("assets/envmap.hdr");
let rt = pmrem.fromEquirectangular(envmapTexture);
envmap = rt.texture;

// Load textures
let textures = {
   grass: await new TextureLoader().loadAsync("assets/grass.jpg"),
   stone: await new TextureLoader().loadAsync("assets/stone.png"),
};

// Configure textures
textures.grass.wrapS = textures.grass.wrapT = RepeatWrapping;
textures.grass.repeat.set(4, 4);

textures.stone.wrapS = textures.stone.wrapT = RepeatWrapping;
textures.stone.repeat.set(2, 2);

// Generate the maze
let maze = generateMaze(MAZE_SIZE);
console.log("Generated maze:", maze);

// Create hexagons for the maze
for (let i = -MAZE_SIZE; i <= MAZE_SIZE; i++) {
   for (let j = -MAZE_SIZE; j <= MAZE_SIZE; j++) {
       let position = tileToPosition(i, j);
       if (position.length() > ISLAND_RADIUS + 1) continue;

       const mazeI = i + MAZE_SIZE;
       const mazeJ = j + MAZE_SIZE;
       
       // Create a hexagon with the height of a wall or a path
       let height = maze[mazeI]?.[mazeJ] === 1 ? 0.8 * MAX_HEIGHT : 0.2 * MAX_HEIGHT;
       let hex = createHex(height, position, textures, "normal", maze[mazeI]?.[mazeJ] === 1);
       
       // Walls keep their original color, passages become yellow
       if (maze[mazeI]?.[mazeJ] === 0) {
           colorHex(hex, DEFAULT_COLOR);
       }
       
       // Store the hexagon reference with its coordinates
       hexMeshes.set(`${mazeI},${mazeJ}`, hex);
   }
}

// Define start and end points for pathfinding
const startPoint = { x: 1, y: MAZE_SIZE }; // Start point
const endPoint = { x: 39, y: MAZE_SIZE };  // End point

console.log("Start:", startPoint, "End:", endPoint);

// Validate the maze to ensure a path exists
validateMaze(maze, startPoint, endPoint);

// Run the improved A* algorithm
const path = aStarPathfinding(maze, startPoint, endPoint);
console.log("Path length:", path.length);
console.log("Path:", path);

// Color only the final path in green (others are already yellow)
for (const node of path) {
   const key = `${node.x},${node.y}`;
   const hex = hexMeshes.get(key);
   if (hex) {
       colorHex(hex, SOLUTION_COLOR);
   }
}

// Animation loop
renderer.setAnimationLoop(() => {
   controls.update();
   renderer.render(scene, camera);
});
})();