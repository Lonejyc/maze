# Labyrinthe Hexagonal 3D

Ce projet est un labyrinthe 3D généré de manière procédurale, utilisant des hexagones pour représenter les cases. Le système implémente également un algorithme de recherche de chemin A* pour trouver le chemin optimal entre l'entrée et la sortie.

![Aperçu du Labyrinthe Hexagonal](https://via.placeholder.com/800x400?text=Labyrinthe+Hexagonal+3D)

## Caractéristiques

- Génération procédurale de labyrinthe
- Rendu 3D avec Three.js
- Navigation par contrôles orbitaux
- Textures réalistes pour les murs et les passages
- Algorithme de pathfinding A* optimisé
- Visualisation du chemin optimal en couleur

## Technologies utilisées

- Three.js
- Algorithmes de génération de labyrinthe
- Algorithme de pathfinding A*

## Structure du projet

Le projet est structuré en plusieurs modules JavaScript pour une meilleure organisation et maintenabilité :

- `main.js` - Point d'entrée, initialisation de base
- `scene.js` - Configuration de la scène, caméra, renderer
- `maze.js` - Génération et validation du labyrinthe
- `pathfinding.js` - Algorithme A* pour trouver le chemin
- `hexagons.js` - Création et gestion des hexagones
- `utils.js` - Fonctions utilitaires

## Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/username/hexagonal-maze.git
cd hexagonal-maze
```

2. Assurez-vous d'avoir les assets nécessaires dans un dossier `assets/` :
   - `envmap.hdr` - Carte d'environnement HDR
   - `grass.jpg` - Texture d'herbe pour les passages
   - `stone.png` - Texture de pierre pour les murs

3. Servez le projet avec un serveur HTTP local (nécessaire pour les modules ES6) :
```bash
npx serve
# ou avec Python
python -m http.server
```

4. Ouvrez votre navigateur à l'adresse indiquée par le serveur (généralement http://localhost:3000 ou http://localhost:8000)

## Comment ça marche

### Génération du labyrinthe

Le labyrinthe est généré en utilisant un algorithme de backtracking récursif, qui garantit un chemin entre tout point A et point B.

```javascript
// Extrait de maze.js
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
```

### Algorithme de Pathfinding

L'algorithme A* est utilisé pour trouver le chemin optimal entre le point de départ et d'arrivée :

```javascript
// Extrait de pathfinding.js
export function aStarPathfinding(maze, start, end) {
    // Implémentation de l'algorithme A*
    // Utilise une file de priorité pour explorer les chemins les plus prometteurs d'abord
    // ...
}
```

### Rendu 3D

Le rendu utilise Three.js pour créer une scène 3D interactive :

```javascript
// Extrait de scene.js
export function setupScene() {
    const scene = new Scene();
    scene.background = new Color("#FFEECC");
    return scene;
}
```

## Personnalisation

Vous pouvez personnaliser plusieurs aspects du labyrinthe en modifiant les constantes dans `main.js` :

```javascript
export const MAX_HEIGHT = 5;           // Hauteur maximale des hexagones
export const ISLAND_RADIUS = 32;       // Rayon de l'île
export const TILE_SIZE = 1.77;         // Taille des tuiles hexagonales
export const MAZE_SIZE = 20;           // Taille du labyrinthe
```

## Dépendances

- Three.js (via Skypack CDN)
- three-stdlib (pour OrbitControls, RGBELoader, etc.)
- simplex-noise (pour la génération de terrain, si utilisé)

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Contributions

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request
