# AI System Documentation

This document describes how the Tetr.js AI system works.

## Overview

The AI uses a heuristic-based evaluation function to score potential piece placements. It searches all possible positions (rotations and X coordinates), simulates placing the piece, evaluates the resulting board state, and chooses the placement with the highest score.

## Evaluation Features

The AI calculates 10 features for each potential placement:

| Feature | Description | Default Weight |
|---------|-------------|----------------|
| **Landing Height** | Height where the piece lands (center of piece) | -1.0 |
| **Rows Cleared** | Number of complete lines cleared | +3.0 |
| **Row Transitions** | Horizontal cell changes (filled<->empty) | -0.5 |
| **Column Transitions** | Vertical cell changes (filled<->empty) | -0.5 |
| **Holes** | Empty cells with filled cells above | -4.0 |
| **Well Sums** | Deep wells (single-column gaps) | -0.5 |
| **Bumpiness** | Sum of height differences between adjacent columns | -0.5 |
| **Hole Depth** | Maximum depth of holes in each column | -1.0 |
| **Aggregate Height** | Sum of all column heights | -0.5 |
| **Covered Cells** | Number of filled cells above holes | -1.0 |

## Search Algorithm

### Basic Search
1. Generate all 4 rotations of the current piece (deduplicated using bit hashing)
2. For each rotation, try X positions from -2 to 9
3. Drop piece to landing position
4. Simulate placement and evaluate resulting board
5. Choose position with highest score

### 2-Step Lookahead
When preview queue is available:
1. For each potential placement of current piece
2. Simulate the placement
3. Find best placement for next piece in preview
4. Combined score = current_score + 0.5 * next_best_score

### Early Pruning
Placements that create more than 3 new holes are skipped to improve performance.

## Rotation System

The AI uses the same Super Rotation System (SRS) as the game:
- Clockwise rotation algorithm matches `Piece.prototype.rotate(1)`
- Ensures AI's planned rotations match actual game execution

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

## Movement Animation

The AI executes moves in a human-like sequence:

1. **Bring into view**: Soft drop until piece is visible (y >= 2)
2. **Think delay**: Optional random delay (100-500ms) to simulate thinking
3. **Rotate**: Execute all rotations first (one per frame)
4. **Move horizontally**: Move left/right toward target X
5. **Drop**: Hard drop or soft drop based on settings

## Ghost Piece

When AI is enabled, the ghost piece shows the AI's planned final position:
- Stored in `window.AI_PLANNED_MOVE = { x, y, tetro }`
- Updated after rotations during animation
- Cleared when piece locks

## Performance Optimizations

1. **Bit hashing**: Tetromino deduplication uses bit operations instead of JSON.stringify
2. **Column height caching**: Pre-calculated for reuse across feature calculations
3. **Early pruning**: Skip placements creating excessive holes
4. **Incremental updates**: Only recalculate changed portions when possible

## Code Location

Main AI implementation: `piece.js:298-1416`

Key functions:
- `aiEvaluate()` - Calculate board score
- `aiSimulate()` - Simulate piece placement
- `getAllPlacements()` - Generate all valid placements
- `getBestMoveWithLookahead()` - 2-step lookahead search
- `aiMove()` - Main AI entry point with animation
