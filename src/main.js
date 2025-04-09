import { 
    WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, 
    Color, CylinderGeometry, 
    RepeatWrapping, DoubleSide, BoxGeometry, Mesh, PointLight, MeshPhysicalMaterial, PerspectiveCamera,
    Scene, PMREMGenerator, PCFSoftShadowMap,
    Vector2, TextureLoader, SphereGeometry, MeshStandardMaterial
} from 'https://cdn.skypack.dev/three@0.137';
import { OrbitControls } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';
import { RGBELoader } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';

// Création de la scène
const scene = new Scene();
scene.background = new Color("#FFEECC");

// Création de la caméra
const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(-27, 41, 33);

// Création du rendu
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Création d'une lumière directionnelle
const light = new PointLight(new Color("#FFCB8E").convertSRGBToLinear().convertSRGBToLinear(), 80, 200);
light.position.set(10, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
scene.add(light);

// Création d'une lumière ambiante
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

// Création d'une lumière ambiante
let pmrem = new PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

let envmap;
const MAX_HEIGHT = 5;
const ISLAND_RADIUS = 32;
const TILE_SIZE = 1.77;
const MAZE_SIZE = 20;

// Couleurs pour le pathfinding
const SOLUTION_COLOR = new Color("#00CC00"); // Vert = chemin final
const DEFAULT_COLOR = new Color("#FFFF00"); // Jaune = toutes les autres dalles

// Stockage des hexagones avec leur position
const hexMeshes = new Map();

(async function() {
    // Chargement de la texture HDR
    let envmapTexture = await new RGBELoader().loadAsync("assets/envmap.hdr");
    let rt = pmrem.fromEquirectangular(envmapTexture);
    envmap = rt.texture;

    // Chargement des textures de terre et de pierre
    let textures = {
        grass: await new TextureLoader().loadAsync("assets/grass.jpg"),
        stone: await new TextureLoader().loadAsync("assets/stone.png"),
    };
    
    // Configuration des textures
    textures.grass.wrapS = textures.grass.wrapT = RepeatWrapping;
    textures.grass.repeat.set(4, 4);
    
    textures.stone.wrapS = textures.stone.wrapT = RepeatWrapping;
    textures.stone.repeat.set(2, 2);

    let maze = generateMaze(MAZE_SIZE);
    
    console.log("Generated maze:", maze);
    
    // Création des hexagones pour le labyrinthe
    for (let i = -MAZE_SIZE; i <= MAZE_SIZE; i++) {
        for (let j = -MAZE_SIZE; j <= MAZE_SIZE; j++) {
            let position = tileToPosition(i, j);
            if (position.length() > ISLAND_RADIUS + 1) continue;

            const mazeI = i + MAZE_SIZE;
            const mazeJ = j + MAZE_SIZE;
            
            // Créer un hexagone de la hauteur d'un mur ou d'un chemin
            let height = maze[mazeI]?.[mazeJ] === 1 ? 0.8 * MAX_HEIGHT : 0.2 * MAX_HEIGHT;
            let hex = createHex(height, position, textures, "normal", maze[mazeI]?.[mazeJ] === 1);
            
            // Les murs gardent leur couleur originale, les passages deviennent jaunes
            if (maze[mazeI]?.[mazeJ] === 0) {
                colorHex(hex, DEFAULT_COLOR);
            }
            
            // Stocker la référence à l'hexagone avec ses coordonnées
            hexMeshes.set(`${mazeI},${mazeJ}`, hex);
        }
    }
    
    // Définir le point de départ et d'arrivée pour le pathfinding
    const startPoint = { x: 1, y: MAZE_SIZE }; // Point de départ
    const endPoint = { x: 39, y: MAZE_SIZE };  // Point d'arrivée
    
    console.log("Start:", startPoint, "End:", endPoint);
    
    // Valider le labyrinthe pour s'assurer qu'un chemin existe
    validateMaze(maze, startPoint, endPoint);
    
    // Exécuter l'algorithme A* amélioré
    const path = aStarPathfinding(maze, startPoint, endPoint);
    console.log("Path length:", path.length);
    console.log("Path:", path);
    
    // Colorer uniquement le chemin final en vert (les autres sont déjà jaunes)
    for (const node of path) {
        const key = `${node.x},${node.y}`;
        const hex = hexMeshes.get(key);
        if (hex) {
            colorHex(hex, SOLUTION_COLOR);
        }
    }

    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    });
})();

// Fonction pour colorer un hexagone existant
function colorHex(hexMesh, color) {
    if (hexMesh && hexMesh.material) {
        // Cloner le matériel pour ne pas affecter d'autres hexagones
        hexMesh.material = hexMesh.material.clone();
        hexMesh.material.color = color;
        hexMesh.material.needsUpdate = true;
    }
}

// Fonction pour vérifier qu'il existe un chemin entre le départ et l'arrivée
function validateMaze(maze, start, end) {
    console.log("Validating maze...");
    console.log("Start:", start, "End:", end);
    console.log("Start cell value:", maze[start.x][start.y]);
    console.log("End cell value:", maze[end.x][end.y]);
    
    // Vérifier que le début et la fin sont des passages
    if (maze[start.x]?.[start.y] !== 0 || maze[end.x]?.[end.y] !== 0) {
        console.error("Start or end is not a valid passage!");
        
        // Corriger si nécessaire
        maze[start.x][start.y] = 0;
        maze[end.x][end.y] = 0;
        console.log("Fixed start and end points to be passages.");
    }
    
    // Utiliser un simple BFS pour vérifier l'accessibilité
    const queue = [start];
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);
    
    const directions = [
        { dx: 0, dy: -1 }, // Haut
        { dx: 1, dy: 0 },  // Droite
        { dx: 0, dy: 1 },  // Bas
        { dx: -1, dy: 0 }  // Gauche
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        if (current.x === end.x && current.y === end.y) {
            console.log("Path exists between start and end!");
            return true;
        }
        
        for (const dir of directions) {
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            const newKey = `${newX},${newY}`;
            
            if (newX >= 0 && newX < maze.length && 
                newY >= 0 && newY < maze[0].length && 
                maze[newX][newY] === 0 && 
                !visited.has(newKey)) {
                
                visited.add(newKey);
                queue.push({ x: newX, y: newY });
            }
        }
    }
    
    console.error("No path exists between start and end!");
    
    // Créer un chemin si nécessaire
    console.log("Creating a path...");
    let currentX = start.x;
    let currentY = start.y;
    
    while (currentX !== end.x || currentY !== end.y) {
        // Avancer vers la fin
        if (currentX < end.x) currentX++;
        else if (currentX > end.x) currentX--;
        else if (currentY < end.y) currentY++;
        else if (currentY > end.y) currentY--;
        
        // Marquer comme passage
        maze[currentX][currentY] = 0;
    }
    
    console.log("Created a direct path to ensure connectivity");
    return true;
}

// Implémentation améliorée de l'algorithme A*
function aStarPathfinding(maze, start, end) {
    // Fonction pour obtenir un identifiant unique pour chaque nœud
    const getNodeId = (x, y) => `${x},${y}`;
    
    // File de priorité pour l'algorithme A*
    class PriorityQueue {
        constructor() {
            this.elements = [];
        }
        
        enqueue(element, priority) {
            this.elements.push({ element, priority });
            this.elements.sort((a, b) => a.priority - b.priority);
        }
        
        dequeue() {
            return this.elements.shift().element;
        }
        
        isEmpty() {
            return this.elements.length === 0;
        }
        
        contains(x, y) {
            return this.elements.some(item => 
                item.element.x === x && item.element.y === y);
        }
        
        update(x, y, newPriority) {
            const index = this.elements.findIndex(item => 
                item.element.x === x && item.element.y === y);
            
            if (index !== -1) {
                this.elements[index].priority = newPriority;
                this.elements.sort((a, b) => a.priority - b.priority);
            }
        }
    }
    
    // Heuristique: distance de Manhattan
    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    // Vérifier que les points de départ et d'arrivée sont valides
    if (!maze[start.x] || !maze[start.y] || maze[start.x][start.y] !== 0 || 
        !maze[end.x] || !maze[end.y] || maze[end.x][end.y] !== 0) {
        console.error("Start or end points are invalid!");
        return [];
    }
    
    // Initialisation des structures de données
    const openSet = new PriorityQueue();
    openSet.enqueue(start, 0);
    
    const cameFrom = new Map();
    
    const gScore = new Map();
    gScore.set(getNodeId(start.x, start.y), 0);
    
    const fScore = new Map();
    fScore.set(getNodeId(start.x, start.y), heuristic(start, end));
    
    const closed = new Set();
    
    // Directions possibles: haut, droite, bas, gauche
    const directions = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }
    ];
    
    // Boucle principale de l'algorithme A*
    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentId = getNodeId(current.x, current.y);
        
        // Si on est arrivé à destination
        if (current.x === end.x && current.y === end.y) {
            // Reconstruire le chemin
            const path = [];
            let currentNode = current;
            
            while (cameFrom.has(getNodeId(currentNode.x, currentNode.y))) {
                path.unshift(currentNode);
                currentNode = cameFrom.get(getNodeId(currentNode.x, currentNode.y));
            }
            
            path.unshift(start);
            return path;
        }
        
        // Marquer comme visité
        closed.add(currentId);
        
        // Explorer les voisins
        for (const dir of directions) {
            const neighborX = current.x + dir.dx;
            const neighborY = current.y + dir.dy;
            const neighborId = getNodeId(neighborX, neighborY);
            
            // Vérifier si le voisin est valide (dans les limites et passage)
            if (neighborX < 0 || neighborX >= maze.length || 
                neighborY < 0 || neighborY >= maze[0].length || 
                maze[neighborX][neighborY] !== 0 || 
                closed.has(neighborId)) {
                continue;
            }
            
            // Calculer le score g (coût du chemin depuis le départ)
            const tentativeGScore = gScore.get(currentId) + 1;
            
            // Si on n'a pas encore visité ce nœud ou si on a trouvé un meilleur chemin
            if (!gScore.has(neighborId) || tentativeGScore < gScore.get(neighborId)) {
                // Mettre à jour les informations
                cameFrom.set(neighborId, current);
                gScore.set(neighborId, tentativeGScore);
                const newFScore = tentativeGScore + heuristic({ x: neighborX, y: neighborY }, end);
                fScore.set(neighborId, newFScore);
                
                // Ajouter ou mettre à jour dans la file de priorité
                if (openSet.contains(neighborX, neighborY)) {
                    openSet.update(neighborX, neighborY, newFScore);
                } else {
                    openSet.enqueue({ x: neighborX, y: neighborY }, newFScore);
                }
            }
        }
    }
    
    // Aucun chemin trouvé
    console.error("No path found!");
    return [];
}

function generateMaze(size) {
    let map = Array.from({ length: size * 2 + 1 }, () => Array(size * 2 + 1).fill(1));
    function carve(x, y) {
        map[x][y] = 0;
        let directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        directions.sort(() => Math.random() - 0.5);
        for (let [dx, dy] of directions) {
            let nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < size * 2 && ny > 0 && ny < size * 2 && map[nx][ny] === 1 && tileToPosition(nx - size, ny - size).length() <= ISLAND_RADIUS) {
                map[x + dx / 2][y + dy / 2] = 0;
                carve(nx, ny);
            }
        }
    }
    carve(size, size);
    return map;
}

function tileToPosition(tileX, tileY) {
    return new Vector2((tileX + (tileY % 2) * 0.5) * TILE_SIZE, tileY * 1.535);
}

function createHex(height, position, textures, tileType, isWall) {
    let geo = new CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);
    
    let material = new MeshPhysicalMaterial({ 
        envMap: envmap, 
        envMapIntensity: 0.135, 
        flatShading: true, 
        map: isWall ? textures.stone : textures.grass
    });
    
    let mesh = new Mesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    return mesh;
}