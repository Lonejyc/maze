// A* pathfinding algorithm implementation
export function aStarPathfinding(maze, start, end) {
    // Function to get a unique identifier for each node
    const getNodeId = (x, y) => `${x},${y}`;
    
    // Priority queue for A* algorithm
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
    
    // Heuristic: Manhattan distance
    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    // Check that start and end points are valid
    if (!maze[start.x] || !maze[start.y] || maze[start.x][start.y] !== 0 || 
        !maze[end.x] || !maze[end.y] || maze[end.x][end.y] !== 0) {
        console.error("Start or end points are invalid!");
        return [];
    }
    
    // Initialize data structures
    const openSet = new PriorityQueue();
    openSet.enqueue(start, 0);
    
    const cameFrom = new Map();
    
    const gScore = new Map();
    gScore.set(getNodeId(start.x, start.y), 0);
    
    const fScore = new Map();
    fScore.set(getNodeId(start.x, start.y), heuristic(start, end));
    
    const closed = new Set();
    
    // Possible directions: up, right, down, left
    const directions = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }
    ];
    
    // Main A* algorithm loop
    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentId = getNodeId(current.x, current.y);
        
        // If we reached the destination
        if (current.x === end.x && current.y === end.y) {
            // Reconstruct the path
            const path = [];
            let currentNode = current;
            
            while (cameFrom.has(getNodeId(currentNode.x, currentNode.y))) {
                path.unshift(currentNode);
                currentNode = cameFrom.get(getNodeId(currentNode.x, currentNode.y));
            }
            
            path.unshift(start);
            return path;
        }
        
        // Mark as visited
        closed.add(currentId);
        
        // Explore neighbors
        for (const dir of directions) {
            const neighborX = current.x + dir.dx;
            const neighborY = current.y + dir.dy;
            const neighborId = getNodeId(neighborX, neighborY);
            
            // Check if neighbor is valid (within bounds and passage)
            if (neighborX < 0 || neighborX >= maze.length || 
                neighborY < 0 || neighborY >= maze[0].length || 
                maze[neighborX][neighborY] !== 0 || 
                closed.has(neighborId)) {
                continue;
            }
            
            // Calculate g score (cost of path from start)
            const tentativeGScore = gScore.get(currentId) + 1;
            
            // If we haven't visited this node yet or if we found a better path
            if (!gScore.has(neighborId) || tentativeGScore < gScore.get(neighborId)) {
                // Update information
                cameFrom.set(neighborId, current);
                gScore.set(neighborId, tentativeGScore);
                const newFScore = tentativeGScore + heuristic({ x: neighborX, y: neighborY }, end);
                fScore.set(neighborId, newFScore);
                
                // Add or update in the priority queue
                if (openSet.contains(neighborX, neighborY)) {
                    openSet.update(neighborX, neighborY, newFScore);
                } else {
                    openSet.enqueue({ x: neighborX, y: neighborY }, newFScore);
                }
            }
        }
    }
    
    // No path found
    console.error("No path found!");
    return [];
}