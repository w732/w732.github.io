---
title: "Building a Tetris AI: Heuristic Evaluation and Search Strategies"
date: 2026-01-23
tags: ["AI", "Games", "Algorithms", "JavaScript", "Machine Learning"]
---

This article provides a comprehensive technical deep-dive into building an AI for Tetris. We'll cover the fundamental mechanics of modern Tetris, the heuristic evaluation approach, and how to combine multiple features into an effective AI player.

## Table of Contents

1. [Tetris Fundamentals](#tetris-fundamentals)
2. [AI Architecture Overview](#ai-architecture-overview)
3. [Heuristic Features](#heuristic-features)
4. [Search Algorithm](#search-algorithm)
5. [Weight Tuning](#weight-tuning)
6. [Advanced Techniques](#advanced-techniques)
7. [Implementation Details](#implementation-details)

---

## Tetris Fundamentals

Before diving into AI strategies, let's understand the core mechanics of modern Tetris (specifically the Tetris Guideline standard).

### The Seven Tetrominoes

Tetris uses exactly seven distinct pieces, each made of four connected squares:

```
I-piece:  ████      J-piece:  █        L-piece:    █
                              ███                ███

O-piece:  ██        S-piece:   ██      T-piece:   █
          ██                  ██                 ███

Z-piece:  ██
           ██
```

Each piece has a unique color and rotation behavior.

### 7-Bag Randomizer

Modern Tetris doesn't use pure random piece generation. Instead, it uses the **7-Bag system**:

1. Take all 7 tetrominoes and put them in a "bag"
2. Shuffle the bag randomly
3. Deal pieces one by one from the bag
4. When the bag is empty, refill with all 7 pieces and shuffle again

This guarantees:
- You'll never wait more than 12 pieces for any specific tetromino
- The worst drought for any piece is 12 (end of one bag + start of next)
- More predictable gameplay compared to pure random

```javascript
// 7-Bag implementation
Preview.prototype.gen = function() {
    var pieceList = [0, 1, 2, 3, 4, 5, 6];
    return pieceList.sort(function() {
        return 0.5 - Math.random();
    });
};
```

### Super Rotation System (SRS)

The **Super Rotation System** is the standard rotation system for modern Tetris. It defines:

1. **Basic Rotation**: How pieces rotate around their center
2. **Wall Kicks**: Alternative positions when basic rotation fails

#### Basic Rotation

Pieces rotate around a center point. For a clockwise rotation:

```javascript
function rotateTetroClockwise(tetro) {
    const size = tetro.length;
    const rotated = [];
    for (let i = 0; i < size; i++) {
        rotated[i] = [];
        for (let row = size - 1; row >= 0; row--) {
            rotated[i][row] = tetro[row][size - 1 - i];
        }
    }
    return rotated;
}
```

#### Wall Kicks

When a piece can't rotate in place (blocked by wall or other pieces), the game tries alternative positions called **wall kicks**. Each piece has a kick table defining offsets to try:

```javascript
// Standard wall kick data for J, L, S, T, Z pieces
const kickData = [
    [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],   // State 0
    [[0,0], [1,0], [1,1], [0,-2], [1,-2]],     // State 1
    [[0,0], [1,0], [1,-1], [0,2], [1,2]],      // State 2
    [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]]   // State 3
];
```

The rotation algorithm:
1. Try basic rotation at current position
2. If blocked, try each offset in the kick table
3. Use first valid position found
4. If all fail, rotation doesn't happen

### Hold System

Players can "hold" the current piece for later use:
- Press hold to swap current piece with held piece
- If no held piece, current piece goes to hold and next piece spawns
- Can only hold once per piece (prevents infinite stalling)

### Preview Queue

Modern Tetris shows upcoming pieces (typically 5-6). This is crucial for AI planning.

### Lock Delay

When a piece lands, there's a brief delay before it locks. During this time:
- Player can still move/rotate the piece
- Moving resets the lock delay (up to a limit)
- This enables advanced techniques like T-Spins

---

## AI Architecture Overview

Our Tetris AI uses a **heuristic evaluation** approach:

```
┌─────────────────────────────────────────────────────────┐
│                    AI Decision Loop                      │
├─────────────────────────────────────────────────────────┤
│  1. Generate all possible placements                     │
│     - 4 rotations × ~12 X positions ≈ 48 placements     │
│                                                          │
│  2. For each placement:                                  │
│     - Simulate piece placement                           │
│     - Calculate heuristic features                       │
│     - Compute weighted score                             │
│                                                          │
│  3. Select placement with highest score                  │
│                                                          │
│  4. Execute moves (rotate, shift, drop)                  │
└─────────────────────────────────────────────────────────┘
```

The key insight is that we don't need to simulate future games or use complex tree search. A well-tuned heuristic evaluation of the immediate board state is surprisingly effective.

---

## Heuristic Features

The AI evaluates board states using 10 features. Each captures a different aspect of "board quality."

### 1. Landing Height

**What it measures**: How high the piece lands on the stack.

**Why it matters**: Lower placements are generally better. High placements indicate danger (close to game over).

```javascript
function calculateLandingHeight(landingY, tetro) {
    let minY = GRID_HEIGHT, maxY = 0;
    for (let dx = 0; dx < tetro.length; dx++) {
        for (let dy = 0; dy < tetro[dx].length; dy++) {
            if (tetro[dx][dy]) {
                const actualY = landingY + dy;
                if (actualY < minY) minY = actualY;
                if (actualY > maxY) maxY = actualY;
            }
        }
    }
    // Return height from bottom (higher = worse)
    return GRID_HEIGHT - (minY + maxY) / 2;
}
```

**Typical weight**: -1.0 (negative = prefer lower)

### 2. Rows Cleared

**What it measures**: Number of complete lines cleared by this placement.

**Why it matters**: Clearing lines is the primary goal. More clears = better.

```javascript
function calculateRowsCleared(grid) {
    let lines = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        let full = true;
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (!grid[x][y]) { full = false; break; }
        }
        if (full) lines++;
    }
    return lines;
}
```

**Typical weight**: +3.0 (positive = reward clearing)

### 3. Row Transitions

**What it measures**: Number of horizontal transitions between filled and empty cells.

**Why it matters**: High transitions indicate a "jagged" surface that's hard to clear. Smooth rows are easier to complete.

```
Low transitions (good):    High transitions (bad):
██████████                 █ █ █ █ █
██████████                 █ █ █ █ █
```

```javascript
function calculateRowTransitions(grid) {
    let transitions = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        let prev = 1; // Treat border as filled
        for (let x = 0; x < GRID_WIDTH; x++) {
            const current = grid[x][y] ? 1 : 0;
            if (current !== prev) transitions++;
            prev = current;
        }
        if (prev === 0) transitions++; // Right border
    }
    return transitions;
}
```

**Typical weight**: -0.5

### 4. Column Transitions

**What it measures**: Number of vertical transitions in each column.

**Why it matters**: Vertical transitions often indicate holes or overhangs—both problematic.

```javascript
function calculateColumnTransitions(grid) {
    let transitions = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        let prev = 1; // Treat top as filled
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const current = grid[x][y] ? 1 : 0;
            if (current !== prev) transitions++;
            prev = current;
        }
    }
    return transitions;
}
```

**Typical weight**: -0.5

### 5. Holes

**What it measures**: Empty cells with at least one filled cell above them.

**Why it matters**: Holes are devastating—they waste space and require clearing multiple lines above to fix.

```
Hole example:
  ███ ███
  ███○███   ← The ○ is a hole
  ████████
```

```javascript
function calculateHoles(grid) {
    let holes = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        let blockFound = false;
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y]) {
                blockFound = true;
            } else if (blockFound) {
                holes++;
            }
        }
    }
    return holes;
}
```

**Typical weight**: -4.0 (heavily penalized)

### 6. Well Sums

**What it measures**: Depth of "wells"—single-column gaps bounded by filled cells on both sides.

**Why it matters**: Deep wells are problematic because only I-pieces can fill them efficiently. Wells of depth > 4 are particularly bad.

```
Well example:
  ███ ███
  ███ ███   ← This is a well of depth 3
  ███ ███
  █████████
```

```javascript
function calculateWellSums(grid) {
    let wellSums = 0;

    // Check each column for wells
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            // Check if this is a well cell
            const leftBlocked = (x === 0) || grid[x-1][y];
            const rightBlocked = (x === GRID_WIDTH-1) || grid[x+1][y];

            if (!grid[x][y] && leftBlocked && rightBlocked) {
                // Count well depth
                let depth = 1;
                while (y + depth < GRID_HEIGHT && !grid[x][y + depth]) {
                    depth++;
                }
                wellSums += depth;
            }
        }
    }
    return wellSums;
}
```

**Typical weight**: -0.5

### 7. Bumpiness

**What it measures**: Sum of absolute height differences between adjacent columns.

**Why it matters**: A flat surface is easier to build on and clear. Bumpy surfaces create dependencies and awkward placements.

```
Low bumpiness (good):      High bumpiness (bad):
    █                         █
   ███                        █ █
  █████                      ██ ██
 ███████                    ███ ███
```

```javascript
function calculateBumpiness(grid) {
    const heights = calculateColumnHeights(grid);
    let bumpiness = 0;
    for (let i = 0; i < heights.length - 1; i++) {
        bumpiness += Math.abs(heights[i] - heights[i + 1]);
    }
    return bumpiness;
}

function calculateColumnHeights(grid) {
    const heights = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
        let h = 0;
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y]) {
                h = GRID_HEIGHT - y;
                break;
            }
        }
        heights.push(h);
    }
    return heights;
}
```

**Typical weight**: -0.5

### 8. Hole Depth

**What it measures**: Maximum depth of holes in each column (how many blocks above each hole).

**Why it matters**: Shallow holes (1-2 blocks above) are recoverable. Deep holes (5+ blocks) are nearly permanent damage.

```javascript
function calculateHoleDepth(grid) {
    let totalDepth = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        let blocksAboveHole = 0;
        let inHole = false;

        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y]) {
                if (inHole) {
                    // Still in hole, don't reset counter
                } else {
                    blocksAboveHole++;
                }
            } else {
                // Empty cell
                if (blocksAboveHole > 0) {
                    // This is a hole
                    inHole = true;
                    totalDepth += blocksAboveHole;
                }
            }
        }
    }
    return totalDepth;
}
```

**Typical weight**: -1.0

### 9. Aggregate Height

**What it measures**: Sum of all column heights.

**Why it matters**: Lower overall stack = more room to maneuver = safer. High stacks risk game over.

```javascript
function calculateAggregateHeight(grid) {
    const heights = calculateColumnHeights(grid);
    return heights.reduce((sum, h) => sum + h, 0);
}
```

**Typical weight**: -0.5

### 10. Covered Cells

**What it measures**: Number of filled cells directly above holes.

**Why it matters**: More covered cells = more work to clear the hole. This penalizes "burying" holes deep.

```javascript
function calculateCoveredCells(grid) {
    let covered = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        let holeFound = false;
        // Scan from bottom to find holes
        for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
            if (!grid[x][y]) {
                // Check if there's a block above
                for (let yAbove = y - 1; yAbove >= 0; yAbove--) {
                    if (grid[x][yAbove]) {
                        holeFound = true;
                        break;
                    }
                }
                if (holeFound) {
                    // Count all blocks above this hole
                    for (let yAbove = y - 1; yAbove >= 0; yAbove--) {
                        if (grid[x][yAbove]) covered++;
                    }
                    break;
                }
            }
        }
    }
    return covered;
}
```

**Typical weight**: -1.0

---

## Search Algorithm

### Basic Search

The simplest approach: evaluate all possible placements and pick the best.

```javascript
Piece.prototype.getBestMove = function() {
    const grid = stack.grid;
    let bestScore = -Infinity;
    let bestMove = null;

    // Try all 4 rotations
    const rotations = getAllRotations(this.tetro);

    for (let r = 0; r < rotations.length; r++) {
        const rotatedTetro = rotations[r];

        // Try all X positions
        for (let x = -2; x < GRID_WIDTH; x++) {
            // Find landing Y (drop simulation)
            let y = 0;
            while (this.moveValidSim(x, y + 1, rotatedTetro, grid)) {
                y++;
            }

            // Skip invalid positions
            if (!this.moveValidSim(x, y, rotatedTetro, grid)) continue;

            // Simulate and evaluate
            const result = aiSimulate(grid, rotatedTetro, x, y);
            const score = aiEvaluate(result.grid, y, rotatedTetro);

            if (score > bestScore) {
                bestScore = score;
                bestMove = { x, y, rotation: r, tetro: rotatedTetro };
            }
        }
    }

    return bestMove;
};
```

### Lookahead Search

Considering the next piece significantly improves play quality:

```javascript
Piece.prototype.getBestMoveWithLookahead = function(nextPieceIndex) {
    const grid = stack.grid;
    let bestScore = -Infinity;
    let bestMove = null;

    const nextTetro = pieces[nextPieceIndex].tetro;
    const DISCOUNT = 0.5; // Weight for future evaluation

    // For each possible placement of current piece
    for (const placement of getAllPlacements(this.tetro, grid)) {
        // Simulate current placement
        const result = aiSimulate(grid, placement.tetro, placement.x, placement.y);
        let score = aiEvaluate(result.grid, placement.y, placement.tetro);

        // Find best placement for next piece on resulting board
        const nextBest = findBestPlacement(nextTetro, result.grid);
        if (nextBest.score > -Infinity) {
            score += DISCOUNT * nextBest.score;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMove = placement;
        }
    }

    return bestMove;
};
```

The discount factor (0.5) balances immediate vs. future gains. Too high makes the AI overly speculative; too low ignores valuable lookahead.

### Early Pruning

Skip obviously bad placements to improve performance:

```javascript
function quickHoleCount(grid, tetro, x, y) {
    let newHoles = 0;
    for (let dx = 0; dx < tetro.length; dx++) {
        for (let dy = 0; dy < tetro[dx].length; dy++) {
            if (tetro[dx][dy]) {
                const gx = x + dx;
                const gy = y + dy;
                // Count empty cells below this mino
                for (let below = gy + 1; below < GRID_HEIGHT; below++) {
                    if (!grid[gx][below]) newHoles++;
                    else break;
                }
            }
        }
    }
    return newHoles;
}

// In search loop:
if (quickHoleCount(grid, tetro, x, y) > 3) {
    continue; // Skip this placement
}
```

---

## Weight Tuning

### The Evaluation Function

The final score is a weighted sum:

```javascript
function aiEvaluate(grid, landingY, tetro) {
    const w = window.AI_WEIGHTS;

    return (
        w.landingHeight * calculateLandingHeight(landingY, tetro) +
        w.rowsCleared * calculateRowsCleared(grid) +
        w.rowTransitions * calculateRowTransitions(grid) +
        w.columnTransitions * calculateColumnTransitions(grid) +
        w.holes * calculateHoles(grid) +
        w.wellSums * calculateWellSums(grid) +
        w.bumpiness * calculateBumpiness(grid) +
        w.holeDepth * calculateHoleDepth(grid) +
        w.aggregateHeight * calculateAggregateHeight(grid) +
        w.coveredCells * calculateCoveredCells(grid)
    );
}
```

### Weight Presets

Different weight combinations produce different play styles:

#### Balanced (Default)
```javascript
{
    landingHeight: -1,
    rowsCleared: 3,
    rowTransitions: -0.5,
    columnTransitions: -0.5,
    holes: -4,
    wellSums: -0.5,
    bumpiness: -0.5,
    holeDepth: -1,
    aggregateHeight: -0.5,
    coveredCells: -1
}
```

#### Conservative (Safe Play)
Heavily penalizes holes and height. Prefers stable, low stacks.

```javascript
{
    landingHeight: -1.5,
    rowsCleared: 2,        // Less reward for clears
    holes: -6,             // Heavily penalize holes
    bumpiness: -1,         // Prefer flat surface
    aggregateHeight: -0.8, // Keep stack low
    coveredCells: -2       // Avoid burying holes
}
```

#### Aggressive (High Score)
Prioritizes line clears, accepts some risk.

```javascript
{
    landingHeight: -0.5,   // Accept higher placements
    rowsCleared: 4,        // Reward clears highly
    holes: -3,             // More tolerant of holes
    bumpiness: -0.3,       // Accept bumpy surfaces
    aggregateHeight: -0.3  // Allow higher stacks
}
```

### Tuning Methods

1. **Manual Tuning**: Play with weights, observe behavior, adjust
2. **Genetic Algorithms**: Evolve weights over many games
3. **Gradient-Based**: Measure performance, compute gradients, optimize
4. **Cross-Entropy Method**: Sample weight vectors, keep best performers

---

## Advanced Techniques

### Hold Decision

Should the AI use the hold piece?

```javascript
Piece.prototype.shouldUseHold = function() {
    if (this.held) return false; // Already used hold

    const currentScore = evaluateBestPlacement(this.tetro, grid);

    const holdPiece = (hold.piece !== undefined)
        ? pieces[hold.piece].tetro
        : pieces[preview.grabBag[0]].tetro;

    const holdScore = evaluateBestPlacement(holdPiece, grid);

    // Use hold if significantly better
    return holdScore > currentScore + 0.5;
};
```

### T-Spin Detection

T-Spins award bonus points. Detecting them:

```javascript
function isTSpin(piece, grid) {
    if (piece.index !== 5) return false; // Not T-piece

    // Check 4 corners of T-piece center
    const cx = piece.x + 1;
    const cy = piece.y + 1;

    const corners = [
        [cx-1, cy-1], [cx+1, cy-1],
        [cx-1, cy+1], [cx+1, cy+1]
    ];

    let filledCorners = 0;
    for (const [x, y] of corners) {
        if (x < 0 || x >= 10 || y >= 22 || grid[x][y]) {
            filledCorners++;
        }
    }

    return filledCorners >= 3;
}
```

### Combo Tracking

Consecutive line clears multiply score:

```javascript
let comboCount = 0;

function onLineClear(linesCleared) {
    if (linesCleared > 0) {
        comboCount++;
        score += linesCleared * 100 * comboCount;
    } else {
        comboCount = 0;
    }
}
```

---

## Implementation Details

### Performance Optimizations

1. **Rotation Deduplication**: Some pieces look identical after rotation (O-piece has 1 unique rotation, I/S/Z have 2). Use hashing to skip duplicates:

```javascript
function tetroHash(tetro) {
    let hash = 0;
    for (let x = 0; x < tetro.length; x++) {
        for (let y = 0; y < tetro[x].length; y++) {
            hash = (hash << 1) | (tetro[x][y] ? 1 : 0);
        }
    }
    return hash;
}
```

2. **Column Height Caching**: Calculate once, reuse for multiple features:

```javascript
function aiEvaluate(grid, landingY, tetro) {
    const heights = calculateColumnHeights(grid); // Calculate once

    const bumpiness = calculateBumpiness(grid, heights);     // Reuse
    const aggregateHeight = calculateAggregateHeight(grid, heights); // Reuse
    // ...
}
```

3. **Incremental Updates**: Instead of recalculating entire board, update only affected columns.

### Animation System

For human-watchable play, animate moves step by step:

```javascript
const animateStep = () => {
    // Step 1: Rotations first
    if (currentRotations < targetRotations) {
        piece.rotate(1);
        currentRotations++;
        setTimeout(animateStep, MOVE_DELAY);
        return;
    }

    // Step 2: Horizontal movement
    if (piece.x < targetX) {
        piece.x += 1;
        setTimeout(animateStep, MOVE_DELAY);
        return;
    } else if (piece.x > targetX) {
        piece.x -= 1;
        setTimeout(animateStep, MOVE_DELAY);
        return;
    }

    // Step 3: Drop
    if (useHardDrop) {
        piece.hardDrop();
    } else {
        softDropStep();
    }
};
```

### Ghost Piece

Show where the AI plans to place the piece:

```javascript
window.AI_PLANNED_MOVE = {
    x: targetX,
    y: targetY,
    tetro: rotatedTetro
};

Piece.prototype.drawGhost = function() {
    if (window.aiEnabled && window.AI_PLANNED_MOVE) {
        const plan = window.AI_PLANNED_MOVE;
        ctx.globalAlpha = 0.3;
        draw(plan.tetro, plan.x, plan.y, ctx);
        ctx.globalAlpha = 1;
    }
};
```

---

## Conclusion

Building a Tetris AI demonstrates several important AI concepts:

1. **Feature Engineering**: Identifying what makes a "good" board state
2. **Heuristic Search**: Finding good solutions without exhaustive search
3. **Weight Tuning**: Balancing multiple objectives
4. **Lookahead**: Planning beyond immediate moves

The heuristic approach is elegant in its simplicity—no neural networks, no massive training datasets. Just careful analysis of what makes Tetris positions good or bad.

For further improvement, consider:
- Deeper lookahead (3+ pieces)
- Monte Carlo Tree Search for difficult situations
- Learning weights through self-play
- Incorporating T-Spin and combo strategies

**[Play the AI](/games/tetris-ai/index.html)** | **[View Source Code](https://github.com/w732/w732.github.io/tree/main/static/games/tetris-ai)**
