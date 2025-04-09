import { Vector2 } from 'https://cdn.skypack.dev/three@0.137';
import { TILE_SIZE } from './main.js';

// Convert tile coordinates to world position
export function tileToPosition(tileX, tileY) {
    return new Vector2((tileX + (tileY % 2) * 0.5) * TILE_SIZE, tileY * 1.535);
}