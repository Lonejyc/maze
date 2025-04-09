// import { 
//     WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, 
//     Color, CylinderGeometry, 
//     RepeatWrapping, DoubleSide, BoxGeometry, Mesh, PointLight, MeshPhysicalMaterial, PerspectiveCamera,
//     Scene, PMREMGenerator, PCFSoftShadowMap,
//     Vector2, TextureLoader, SphereGeometry, MeshStandardMaterial
//   } from 'https://cdn.skypack.dev/three@0.137';
//   import { OrbitControls } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';
//   import { RGBELoader } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader';
//   import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';
//   import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';
  
//   // envmap https://polyhaven.com/a/herkulessaulen
  
//   const scene = new Scene();
//   scene.background = new Color("#FFEECC");
  
//   const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
//   camera.position.set(-17,31,33);
  
//   const renderer = new WebGLRenderer({ antialias: true });
//   renderer.setSize(innerWidth, innerHeight);
//   renderer.toneMapping = ACESFilmicToneMapping;
//   renderer.outputEncoding = sRGBEncoding;
//   renderer.physicallyCorrectLights = true;
//   renderer.shadowMap.enabled = true;
//   renderer.shadowMap.type = PCFSoftShadowMap;
//   document.body.appendChild(renderer.domElement);
  
//   const light = new PointLight( new Color("#FFCB8E").convertSRGBToLinear().convertSRGBToLinear(), 80, 200 );
//   light.position.set(10, 20, 10);
  
//   light.castShadow = true; 
//   light.shadow.mapSize.width = 512; 
//   light.shadow.mapSize.height = 512; 
//   light.shadow.camera.near = 0.5; 
//   light.shadow.camera.far = 500; 
//   scene.add( light );
  
//   const controls = new OrbitControls(camera, renderer.domElement);
//   controls.target.set(0,0,0);
//   controls.dampingFactor = 0.05;
//   controls.enableDamping = true;
  
//   let pmrem = new PMREMGenerator(renderer);
//   pmrem.compileEquirectangularShader();
  
//   let envmap;
  
//   const MAX_HEIGHT = 10;
  
//   (async function() {
//     let envmapTexture = await new RGBELoader().loadAsync("assets/envmap.hdr");
//     let rt = pmrem.fromEquirectangular(envmapTexture);
//     envmap = rt.texture;
  
//     let textures = {
//       grass: await new TextureLoader().loadAsync("assets/grass.jpg"),
//       stone: await new TextureLoader().loadAsync("assets/stone.png"),
//     };
  
//     // const simplex = new SimplexNoise();
  
//     for(let i = -20; i <= 20; i++) {
//       for(let j = -20; j <= 20; j++) {
//         let position = tileToPosition(i, j);
  
//         if(position.length() > 16) continue;
        
//         // let noise = (simplex.noise2D(i * 0.1, j * 0.1) + 1) * 0.5;
//         // noise = Math.pow(noise, 1.5);
//         // let height = noise > 0.5 ? 0.8 * MAX_HEIGHT : 0.2 * MAX_HEIGHT;

//         let height = 0.8 * MAX_HEIGHT;
      
//         hex(height, position, envmap);
//       } 
//     }
  
//     let stoneMesh = hexMesh(stoneGeo, textures.stone);
//     let grassMesh = hexMesh(grassGeo, textures.grass);
//     scene.add(stoneMesh, grassMesh);  
  
//     let mapContainer = new Mesh(
//       new CylinderGeometry(17.1, 17.1, MAX_HEIGHT * 0.25, 50, 1, true),
//       new MeshPhysicalMaterial({
//         envMap: envmap,
//         map: textures.dirt,
//         envMapIntensity: 0.2, 
//         side: DoubleSide,
//       })
//     );
//     mapContainer.receiveShadow = true;
//     mapContainer.rotation.y = -Math.PI * 0.333 * 0.5;
//     mapContainer.position.set(0, MAX_HEIGHT * 0.125, 0);
//     scene.add(mapContainer);
  
//     let mapFloor = new Mesh(
//       new CylinderGeometry(18.5, 18.5, MAX_HEIGHT * 0.1, 50),
//       new MeshPhysicalMaterial({
//         envMap: envmap,
//         map: textures.dirt2,
//         envMapIntensity: 0.1, 
//         side: DoubleSide,
//       })
//     );
//     mapFloor.receiveShadow = true;
//     mapFloor.position.set(0, -MAX_HEIGHT * 0.05, 0);
//     scene.add(mapFloor);
  
//     renderer.setAnimationLoop(() => {
//       controls.update();
//       renderer.render(scene, camera);
//     });
//   })();
  
//   function tileToPosition(tileX, tileY) {
//     return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
//   }
  
//   function hexGeometry(height, position) {
//     let geo  = new CylinderGeometry(1, 1, height, 6, 1, false);
//     geo.translate(position.x, height * 0.5, position.y);
  
//     return geo;
//   }
  
//   const STONE_HEIGHT = MAX_HEIGHT * 0.2;
//   const GRASS_HEIGHT = MAX_HEIGHT * 0;
  
//   let stoneGeo = new BoxGeometry(0,0,0);
//   let grassGeo = new BoxGeometry(0,0,0);
  
//   function hex(height, position) {
//     let geo = hexGeometry(height, position);
  
//     if(height > STONE_HEIGHT) {
//       stoneGeo = mergeBufferGeometries([geo, stoneGeo]);
  
//       if(Math.random() > 0.8) {
//         stoneGeo = mergeBufferGeometries([stoneGeo, stone(height, position)]);
//       }
//     } else if(height > GRASS_HEIGHT) {
//       grassGeo = mergeBufferGeometries([geo, grassGeo]);
//     }
//   }
  
//   function hexMesh(geo, map) {
//     let mat = new MeshPhysicalMaterial({ 
//       envMap: envmap, 
//       envMapIntensity: 0.135, 
//       flatShading: true,
//       map
//     });
  
//     let mesh = new Mesh(geo, mat);
//     mesh.castShadow = true; //default is false
//     mesh.receiveShadow = true; //default
  
//     return mesh;
//   }
  
//   function stone(height, position) {
//     const px = Math.random() * 0.4;
//     const pz = Math.random() * 0.4;
  
//     const geo = new SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7);
//     geo.translate(position.x + px, height, position.y + pz);
  
//     return geo;
//   }


// import { 
//     WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, 
//     Color, CylinderGeometry, 
//     RepeatWrapping, DoubleSide, BoxGeometry, Mesh, PointLight, MeshPhysicalMaterial, PerspectiveCamera,
//     Scene, PMREMGenerator, PCFSoftShadowMap,
//     Vector2, TextureLoader, SphereGeometry, MeshStandardMaterial
// } from 'https://cdn.skypack.dev/three@0.137';
// import { OrbitControls } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';
// import { RGBELoader } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader';
// import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';
// import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';

// const scene = new Scene();
// scene.background = new Color("#FFEECC");

// const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
// camera.position.set(-17,31,33);

// const renderer = new WebGLRenderer({ antialias: true });
// renderer.setSize(innerWidth, innerHeight);
// renderer.toneMapping = ACESFilmicToneMapping;
// renderer.outputEncoding = sRGBEncoding;
// renderer.physicallyCorrectLights = true;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = PCFSoftShadowMap;
// document.body.appendChild(renderer.domElement);

// const light = new PointLight( new Color("#FFCB8E").convertSRGBToLinear().convertSRGBToLinear(), 80, 200 );
// light.position.set(10, 20, 10);

// light.castShadow = true; 
// light.shadow.mapSize.width = 512; 
// light.shadow.mapSize.height = 512; 
// light.shadow.camera.near = 0.5; 
// light.shadow.camera.far = 500; 
// scene.add( light );

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0,0,0);
// controls.dampingFactor = 0.05;
// controls.enableDamping = true;

// let pmrem = new PMREMGenerator(renderer);
// pmrem.compileEquirectangularShader();

// let envmap;

// const MAX_HEIGHT = 10;

// (async function() {
//     let envmapTexture = await new RGBELoader().loadAsync("assets/envmap.hdr");
//     let rt = pmrem.fromEquirectangular(envmapTexture);
//     envmap = rt.texture;

//     let textures = {
//         grass: await new TextureLoader().loadAsync("assets/grass.jpg"),
//         stone: await new TextureLoader().loadAsync("assets/stone.png")
//     };

//     const maze = generateCircularMaze(30, 30);

//     for(let i = 0; i < maze.length; i++) {
//         for(let j = 0; j < maze[i].length; j++) {
//             let position = tileToPosition(i - 15, j - 15);

//             if(maze[i][j] === 1) {
//                 hex(MAX_HEIGHT, position, envmap);
//             }
//         } 
//     }

//     let stoneMesh = hexMesh(stoneGeo, textures.stone);
//     let grassMesh = hexMesh(grassGeo, textures.grass);
//     scene.add(stoneMesh, grassMesh);  

//     let mapContainer = new Mesh(
//         new CylinderGeometry(17.1, 17.1, MAX_HEIGHT * 0.25, 50, 1, true),
//         new MeshPhysicalMaterial({
//             envMap: envmap,
//             map: textures.dirt,
//             envMapIntensity: 0.2, 
//             side: DoubleSide,
//         })
//     );
//     mapContainer.receiveShadow = true;
//     mapContainer.rotation.y = -Math.PI * 0.333 * 0.5;
//     mapContainer.position.set(0, MAX_HEIGHT * 0.125, 0);
//     scene.add(mapContainer);

//     let mapFloor = new Mesh(
//         new CylinderGeometry(18.5, 18.5, MAX_HEIGHT * 0.1, 50),
//         new MeshPhysicalMaterial({
//             envMap: envmap,
//             map: textures.dirt2,
//             envMapIntensity: 0.1, 
//             side: DoubleSide,
//         })
//     );
//     mapFloor.receiveShadow = true;
//     mapFloor.position.set(0, -MAX_HEIGHT * 0.05, 0);
//     scene.add(mapFloor);

//     renderer.setAnimationLoop(() => {
//         controls.update();
//         renderer.render(scene, camera);
//     });
// })();

// function tileToPosition(tileX, tileY) {
//     return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
// }

// function hexGeometry(height, position) {
//     let geo  = new CylinderGeometry(1, 1, height, 6, 1, false);
//     geo.translate(position.x, height * 0.5, position.y);

//     return geo;
// }

// const STONE_HEIGHT = MAX_HEIGHT * 0.2;
// const GRASS_HEIGHT = MAX_HEIGHT * 0;

// let stoneGeo = new BoxGeometry(0,0,0);
// let grassGeo = new BoxGeometry(0,0,0);

// function hex(height, position) {
//     let geo = hexGeometry(height, position);

//     if(height > STONE_HEIGHT) {
//         stoneGeo = mergeBufferGeometries([geo, stoneGeo]);

//         if(Math.random() > 0.8) {
//             stoneGeo = mergeBufferGeometries([stoneGeo, stone(height, position)]);
//         }
//     } else if(height > GRASS_HEIGHT) {
//         grassGeo = mergeBufferGeometries([geo, grassGeo]);
//     }
// }

// function hexMesh(geo, map) {
//     let mat = new MeshPhysicalMaterial({ 
//         envMap: envmap, 
//         envMapIntensity: 0.135, 
//         flatShading: true,
//         map
//     });

//     let mesh = new Mesh(geo, mat);
//     mesh.castShadow = true; //default is false
//     mesh.receiveShadow = true; //default

//     return mesh;
// }

// function stone(height, position) {
//     const px = Math.random() * 0.4;
//     const pz = Math.random() * 0.4;

//     const geo = new SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7);
//     geo.translate(position.x + px, height, position.y + pz);

//     return geo;
// }

// function generateCircularMaze(width, height) {
//     const maze = Array.from({ length: height }, () => Array(width).fill(0));
//     const stack = [[1, 1]];
//     maze[1][1] = 1;

//     const directions = [
//         [0, 2], [2, 0], [0, -2], [-2, 0]
//     ];

//     while (stack.length) {
//         const [x, y] = stack.pop();
//         directions.sort(() => Math.random() - 0.5);

//         for (const [dx, dy] of directions) {
//             const nx = x + dx;
//             const ny = y + dy;

//             if (nx > 0 && ny > 0 && nx < width - 1 && ny < height - 1 && maze[ny][nx] === 0) {
//                 maze[ny][nx] = 1;
//                 maze[y + dy / 2][x + dx / 2] = 1;
//                 stack.push([nx, ny]);
//             }
//         }
//     }

//     // Create circular shape
//     const centerX = Math.floor(width / 2);
//     const centerY = Math.floor(height / 2);
//     const radius = Math.min(centerX, centerY);

//     for (let i = 0; i < height; i++) {
//         for (let j = 0; j < width; j++) {
//             const position = tileToPosition(i - centerY, j - centerX);
//             if (position.length() > radius) {
//                 maze[i][j] = 0;
//             }
//         }
//     }

//     // Add entry and exit

//     // Create circular wall with entry and exit
//     for (let angle = 0; angle < 360; angle += 1) {
//         const rad = angle * (Math.PI / 180);
//         const x = Math.floor(centerX + (radius - 6) * Math.cos(rad) * 1.2);
//         const y = Math.floor(centerY + (radius - 6) * Math.sin(rad));

//         if (x >= 0 && x < width && y >= 0 && y < height && (x !== 1 || y !== 0) && (x !== width - 2 || y !== height - 1)) {
//             maze[y][x] = 1;
//         }
//     }

//     return maze;
// }

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

const scene = new Scene();
scene.background = new Color("#FFEECC");

const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(-17, 31, 33);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const light = new PointLight(new Color("#FFCB8E").convertSRGBToLinear().convertSRGBToLinear(), 80, 200);
light.position.set(10, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

let pmrem = new PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

let envmap;
const MAX_HEIGHT = 10;
const ISLAND_RADIUS = 16;
const TILE_SIZE = 1.77;
const LABYRINTH_SIZE = 20;

(async function() {
    let envmapTexture = await new RGBELoader().loadAsync("assets/envmap.hdr");
    let rt = pmrem.fromEquirectangular(envmapTexture);
    envmap = rt.texture;

    let textures = {
        grass: await new TextureLoader().loadAsync("assets/grass.jpg"),
        stone: await new TextureLoader().loadAsync("assets/stone.png"),
    };
    
    textures.grass.wrapS = textures.grass.wrapT = RepeatWrapping;
    textures.grass.repeat.set(4, 4);
    
    textures.stone.wrapS = textures.stone.wrapT = RepeatWrapping;
    textures.stone.repeat.set(2, 2);

    let labyrinth = generateLabyrinth(LABYRINTH_SIZE);

    for (let i = -LABYRINTH_SIZE; i <= LABYRINTH_SIZE; i++) {
        for (let j = -LABYRINTH_SIZE; j <= LABYRINTH_SIZE; j++) {
            let position = tileToPosition(i, j);
            if (position.length() > ISLAND_RADIUS) continue;

            let height = labyrinth[i + LABYRINTH_SIZE]?.[j + LABYRINTH_SIZE] === 1 ? 0.8 * MAX_HEIGHT : 0.2 * MAX_HEIGHT;
            hex(height, position, textures);
        }
    }

    let stoneMesh = hexMesh(stoneGeo, textures.stone);
    let grassMesh = hexMesh(grassGeo, textures.grass);
    scene.add(stoneMesh, grassMesh);

    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    });
})();

function generateLabyrinth(size) {
    let map = Array.from({ length: size * 2 + 1 }, () => Array(size * 2 + 1).fill(1));
    function carve(x, y) {
        map[x][y] = 0;
        let directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        directions.sort(() => Math.random() - 0.5);
        for (let [dx, dy] of directions) {
            let nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < size * 2 && ny > 0 && ny < size * 2 && map[nx][ny] === 1) {
                map[x + dx / 2][y + dy / 2] = 0;
                carve(nx, ny);
            }
        }
    }
    carve(1, 1);
    return map;
}

function tileToPosition(tileX, tileY) {
    return new Vector2((tileX + (tileY % 2) * 0.5) * TILE_SIZE, tileY * 1.535);
}

function hex(height, position, textures) {
    let geo = new CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);
    let mat = new MeshPhysicalMaterial({ envMap: envmap, envMapIntensity: 0.135, flatShading: true, map: height > 0.5 * MAX_HEIGHT ? textures.stone : textures.grass });
    let mesh = new Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
}

function hexMesh(geo, map) {
    let mat = new MeshPhysicalMaterial({ envMap: envmap, envMapIntensity: 0.135, flatShading: true, map });
    let mesh = new Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
