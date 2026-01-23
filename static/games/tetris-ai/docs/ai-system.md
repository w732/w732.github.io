# AI System Documentation

This document describes how the Tetr.js AI system works.

## Overview

The AI uses a heuristic-based evaluation function to score potential piece placements. It searches all possible positions (rotations and X coordinates), simulates placing the piece, evaluates the resulting board state, and chooses the placement with the highest score.

## Evaluation Features

The AI calculates 13 features for each potential placement:

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
| **T-Spin Bonus** | Reward for T-Spin line clears | +4.0 |
| **T-Spin Mini** | Reward for T-Spin Mini line clears | +1.0 |
| **Combo Bonus** | Reward for consecutive line clears | +1.0 |

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

The lookahead also simulates combo state:
- If current placement clears lines → next piece evaluated with combo+1
- If current placement doesn't clear → next piece evaluated with combo=0

### Early Pruning
Placements that create more than 3 new holes are skipped to improve performance.

## Hold Decision

The AI automatically evaluates whether to use the Hold feature:

```javascript
Piece.prototype.shouldUseHold = function() {
    // Compare score of current piece vs hold piece
    const currentScore = evaluateBestPlacement(currentPiece);
    const holdScore = evaluateBestPlacement(holdPiece);

    // Use hold if significantly better (threshold: 0.5)
    return holdScore > currentScore + 0.5;
}
```

This is called at the start of each AI move, allowing the AI to swap for a better piece when beneficial.

## T-Spin Detection

The AI detects T-Spins to award bonus points:

```javascript
function detectTSpin(grid, pieceIndex, tetro, x, y, rowsCleared) {
    // Only T-piece (index 5) can T-Spin
    if (pieceIndex !== 5) return { isTSpin: false, isMini: false };
    if (rowsCleared === 0) return { isTSpin: false, isMini: false };

    // Check 4 corners around T center
    // T-Spin: 3+ corners filled
    // T-Spin Mini: 3 corners but only 1 front corner
}
```

T-Spin bonus calculation:
- **T-Spin**: `tSpinWeight × linesCleared` (e.g., T-Spin Double = 4 × 2 = 8)
- **T-Spin Mini**: `tSpinMiniWeight × linesCleared`

## Combo Tracking

The AI tracks and rewards consecutive line clears:

### Tracking
```javascript
// After each piece locks:
if (linesCleared > 0) {
    window.AI_COMBO_COUNT++;
} else {
    window.AI_COMBO_COUNT = 0;
}
```

### Bonus Calculation
```javascript
comboBonus = comboWeight × (comboCount + 1) × linesCleared
```

Example with combo weight = 1:
| Combo | Lines | Bonus |
|-------|-------|-------|
| x0 | 1 | 1×1×1 = 1 |
| x1 | 1 | 1×2×1 = 2 |
| x2 | 2 | 1×3×2 = 6 |
| x5 | 1 | 1×6×1 = 6 |

### Lookahead Simulation
The AI simulates combo state during 2-step lookahead:
- Placement that clears lines → next piece gets higher combo bonus
- This allows AI to "plan for combos" by favoring setups that enable consecutive clears

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

Main AI implementation: `piece.js:298-1500`

Key functions:
- `aiEvaluate()` - Calculate board score (returns {score, linesCleared})
- `aiSimulate()` - Simulate piece placement
- `getAllPlacements()` - Generate all valid placements
- `getBestMoveWithLookahead()` - 2-step lookahead search with combo simulation
- `shouldUseHold()` - Evaluate whether to use Hold
- `detectTSpin()` - Detect T-Spin placements
- `aiMove()` - Main AI entry point with animation
