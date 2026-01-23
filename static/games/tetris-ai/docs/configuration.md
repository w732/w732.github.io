# Configuration Reference

This document lists all configurable options for the Tetr.js AI.

## Global Variables

All AI settings are stored as global `window` variables:

### Core Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `window.aiEnabled` | boolean | `false` | Enable/disable AI auto-play |
| `window.AI_SPEED` | number | `5` | AI speed multiplier (1-10) |
| `window.AI_HARDDROP_ONLY` | boolean | `false` | Use hard drop instead of soft drop |

### Human-like Behavior

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `window.AI_HUMAN_MODE` | boolean | `true` | Enable thinking delays |
| `window.AI_THINK_TIME_MIN` | number | `100` | Minimum think time (ms) |
| `window.AI_THINK_TIME_MAX` | number | `500` | Maximum think time (ms) |
| `window.AI_MOVE_DELAY` | number | `50` | Delay between actions (ms) |

### Claude AI Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `window.AI_USE_CLAUDE` | boolean | `false` | Use Claude API instead of local AI |
| `window.AI_CLAUDE_API_KEY` | string | `''` | Anthropic API key |
| `window.AI_CLAUDE_MODEL` | string | `'claude-sonnet-4-20250514'` | Claude model ID |

### Algorithm Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `window.AI_LOOKAHEAD_DISCOUNT` | number | `0.5` | Weight for 2nd piece evaluation |

## Weight Configuration

### Current Weights

Stored in `window.AI_WEIGHTS` object:

```javascript
window.AI_WEIGHTS = {
    landingHeight: -1,
    rowsCleared: 3,
    rowTransitions: -0.5,
    columnTransitions: -0.5,
    holes: -4,
    wellSums: -0.5,
    bumpiness: -0.5,
    holeDepth: -1,
    aggregateHeight: -0.5,
    coveredCells: -1,
    tSpin: 4,
    tSpinMini: 1,
    combo: 1
};
```

### Weight Presets

Available in `window.AI_WEIGHT_PRESETS`:

#### Balanced (Default)
Good for general play with moderate risk tolerance.

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
    coveredCells: -1,
    tSpin: 4,
    tSpinMini: 1,
    combo: 1
}
```

#### Conservative
Prioritizes clean stacking, minimizes holes and height.

```javascript
{
    landingHeight: -1.5,
    rowsCleared: 2,
    rowTransitions: -0.8,
    columnTransitions: -0.8,
    holes: -6,
    wellSums: -1,
    bumpiness: -1,
    holeDepth: -2,
    aggregateHeight: -0.8,
    coveredCells: -2,
    tSpin: 2,
    tSpinMini: 0.5,
    combo: 0.5
}
```

#### Aggressive
Prioritizes line clears, accepts more risk for higher scores.

```javascript
{
    landingHeight: -0.5,
    rowsCleared: 4,
    rowTransitions: -0.3,
    columnTransitions: -0.3,
    holes: -3,
    wellSums: -0.3,
    bumpiness: -0.3,
    holeDepth: -0.5,
    aggregateHeight: -0.3,
    coveredCells: -0.5,
    tSpin: 6,
    tSpinMini: 2,
    combo: 2
}
```

## Internal State Variables

These are managed by the AI system (do not modify directly):

| Variable | Type | Description |
|----------|------|-------------|
| `window.AI_PLANNED_MOVE` | object/null | Current planned move `{x, y, tetro}` |
| `window.AI_MOVE_QUEUE` | array | Pending move actions |
| `window.AI_IS_ANIMATING` | boolean | Whether AI is executing a move |
| `window.AI_COMBO_COUNT` | number | Current combo count (consecutive line clears) |

## Programmatic Configuration

### Example: Set Custom Weights

```javascript
window.AI_WEIGHTS = {
    landingHeight: -0.8,
    rowsCleared: 2.5,
    rowTransitions: -0.4,
    columnTransitions: -0.4,
    holes: -5,
    wellSums: -0.3,
    bumpiness: -0.2,
    holeDepth: -1.5,
    aggregateHeight: -0.6,
    coveredCells: -1.2,
    tSpin: 5,
    tSpinMini: 1.5,
    combo: 1.5
};
```

### Example: Enable Claude AI

```javascript
window.AI_USE_CLAUDE = true;
window.AI_CLAUDE_API_KEY = 'sk-ant-your-key-here';
window.AI_CLAUDE_MODEL = 'claude-sonnet-4-20250514';
```

### Example: Fast AI (No Delays)

```javascript
window.AI_HUMAN_MODE = false;
window.AI_MOVE_DELAY = 20;
window.AI_HARDDROP_ONLY = true;
```

### Example: Slow Human-like AI

```javascript
window.AI_HUMAN_MODE = true;
window.AI_THINK_TIME_MIN = 500;
window.AI_THINK_TIME_MAX = 1500;
window.AI_MOVE_DELAY = 100;
window.AI_HARDDROP_ONLY = false;
```

### Example: T-Spin Focused AI

```javascript
window.AI_WEIGHTS.tSpin = 8;      // High T-Spin reward
window.AI_WEIGHTS.tSpinMini = 3;  // Moderate Mini reward
window.AI_WEIGHTS.combo = 0.5;    // Lower combo priority
```

### Example: Combo Focused AI

```javascript
window.AI_WEIGHTS.combo = 3;      // High combo reward
window.AI_WEIGHTS.rowsCleared = 2; // Lower single clear reward
window.AI_WEIGHTS.tSpin = 2;      // Lower T-Spin priority
```

## UI Element IDs

For custom UI integration:

| Element ID | Type | Purpose |
|------------|------|---------|
| `ai-autoplay-toggle` | checkbox | Enable AI |
| `ai-weights-btn` | button | Open settings modal |
| `ai-weights-modal` | div | Settings modal container |
| `ai-preset-select` | select | Weight preset dropdown |
| `ai-speed-slider` | range | AI speed control |
| `ai-weight-*` | number | Individual weight inputs |
| `ai-harddrop-toggle` | checkbox | Hard drop toggle |
| `ai-claude-toggle` | checkbox | Enable Claude AI |
| `ai-claude-apikey` | password | API key input |
| `ai-claude-model` | select | Model selection |
| `ai-human-mode-toggle` | checkbox | Human-like delays |
| `ai-think-min` | range | Min think time |
| `ai-think-max` | range | Max think time |
| `ai-move-delay` | range | Move delay slider |
