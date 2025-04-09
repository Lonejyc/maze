import { CylinderGeometry, MeshPhysicalMaterial, Mesh } from 'https://cdn.skypack.dev/three@0.137';
import { scene, envmap } from './main.js';

// Create a hexagon with the specified height and position
export function createHex(height, position, textures, tileType, isWall) {
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

// Function to color an existing hexagon
export function colorHex(hexMesh, color) {
    if (hexMesh && hexMesh.material) {
        // Clone the material to avoid affecting other hexagons
        hexMesh.material = hexMesh.material.clone();
        hexMesh.material.color = color;
        hexMesh.material.needsUpdate = true;
    }
}