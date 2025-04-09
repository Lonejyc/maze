import { Vector2 } from 'https://cdn.skypack.dev/three@0.137';
import { ISLAND_RADIUS, TILE_SIZE } from './main.js';
import { tileToPosition } from './utils.js';

// Generate a maze using recursive backtracking
export function generateMaze(size) {
    let map = Array.from({ length: size * 2 + 1 }, () => Array(size * 2 + 1).fill(1));
    
    function carve(x, y) {
        map[x][y] = 0;
        let directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        directions.sort(() => Math.random() - 0.5);
        
        for (let [dx, dy] of directions) {
            let nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < size * 2 && ny > 0 && ny < size * 2 && 
                map[nx][ny] === 1 && 
                tileToPosition(nx - size, ny - size).length() <= ISLAND_RADIUS) {
                map[x + dx / 2][y + dy / 2] = 0;
                carve(nx, ny);
            }
        }
    }
    
    carve(size, size);
    return map;
}

// Validate the maze to ensure a path exists between start and end
export function validateMaze(maze, start, end) {
    console.log("Validating maze...");
    console.log("Start:", start, "End:", end);
    console.log("Start cell value:", maze[start.x][start.y]);
    console.log("End cell value:", maze[end.x][end.y]);
    
    // Check that start and end are passages
    if (maze[start.x]?.[start.y] !== 0 || maze[end.x]?.[end.y] !== 0) {
        console.error("Start or end is not a valid passage!");
        
        // Fix if necessary
        maze[start.x][start.y] = 0;
        maze[end.x][end.y] = 0;
        console.log("Fixed start and end points to be passages.");
    }
    
    // Use a simple BFS to check accessibility
    const queue = [start];
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);
    
    const directions = [
        { dx: 0, dy: -1 }, // Up
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }  // Left
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
    
    // Create a path if necessary
    console.log("Creating a path...");
    let currentX = start.x;
    let currentY = start.y;
    
    while (currentX !== end.x || currentY !== end.y) {
        // Move toward the end
        if (currentX < end.x) currentX++;
        else if (currentX > end.x) currentX--;
        else if (currentY < end.y) currentY++;
        else if (currentY > end.y) currentY--;
        
        // Mark as passage
        maze[currentX][currentY] = 0;
    }
    
    console.log("Created a direct path to ensure connectivity");
    return true;
}