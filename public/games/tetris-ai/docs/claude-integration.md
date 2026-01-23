# Claude AI Integration

This document describes how to use Claude API to play Tetris.

## Overview

Instead of using the local heuristic AI, you can enable Claude AI mode to have Anthropic's Claude model analyze the game state and decide moves. Claude receives a text representation of the board and returns JSON with rotation count and target X position.

## Setup

### 1. Get an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key (starts with `sk-ant-...`)

### 2. Configure in Game

1. Click "AI Weights Settings" button
2. Scroll to "Claude AI Mode" section
3. Check "Use Claude AI (requires API key)"
4. Paste your API key in the input field
5. Select a model:
   - **Claude Sonnet 4** (Recommended) - Good balance of speed and quality
   - **Claude 3.5 Haiku** - Fastest, lower cost
   - **Claude Opus 4** - Best quality, higher cost
6. Click "Apply"

### 3. Enable AI Auto-play

1. Check "Enable AI Auto-play" on main menu
2. Start a game

## How It Works

### Prompt Structure

Each move, Claude receives:

```
You are playing Tetris. Analyze the game state and decide the best move.

CURRENT PIECE: T
....
.##.
..#.
....

CURRENT BOARD (· = empty, █ = filled):
··········
··········
··········
... (20 rows)
████··████

PREVIEW QUEUE: I, J, L, O
HOLD PIECE: S

PIECE SPAWN POSITION: x=3

RULES:
- Grid is 10 columns (x: 0-9) and 20 visible rows
- You can rotate 0-3 times clockwise
- You can move left/right to position x from -2 to 9
- Goal: Clear lines, avoid holes, keep stack low

Respond with ONLY a JSON object (no other text):
{"rotations": <0-3>, "targetX": <-2 to 9>, "reasoning": "<brief explanation>"}
```

### Response Format

Claude responds with JSON:

```json
{
  "rotations": 1,
  "targetX": 4,
  "reasoning": "Rotating once and placing at x=4 fills the gap and sets up for a line clear"
}
```

### Execution

1. AI parses Claude's JSON response
2. Executes rotations (0-3 clockwise)
3. Moves horizontally to target X
4. Drops piece (hard or soft drop)

## Cost Estimation

Each API call uses approximately:
- **Input tokens**: ~300-400 (board state + prompt)
- **Output tokens**: ~50-100 (JSON response)

Estimated cost per move:
- Haiku: ~$0.0003
- Sonnet: ~$0.002
- Opus: ~$0.01

A typical 40-line Sprint game: 100-150 pieces = $0.03-$1.50 depending on model.

## Browser Security

The API call includes the header:
```
anthropic-dangerous-direct-browser-access: true
```

This is required for direct browser-to-API calls. For production use, consider a backend proxy.

## Fallback Behavior

If Claude API fails (network error, invalid response, etc.):
1. Error is logged to browser console
2. AI falls back to local heuristic for that move
3. Next piece will retry Claude API

## Debugging

Open browser Developer Tools (F12) > Console to see:
- `[Claude] Sending request...` - API call started
- `[Claude] Response: {...}` - Raw response
- `[Claude] Move: 2 rotations, x=5` - Parsed move
- `[Claude] Reasoning: ...` - Claude's explanation
- `[Claude] Error: ...` - Any errors

## Limitations

1. **Latency**: Each move requires an API round-trip (~500-2000ms)
2. **Cost**: API calls cost money
3. **No Wall Kicks**: Claude doesn't account for SRS wall kicks
4. **Simple Board View**: Claude sees current state only, not animation

## Code Location

Claude integration: `piece.js:324-458`

Key functions:
- `gridToText()` - Convert board to text
- `buildClaudePrompt()` - Create prompt
- `callClaudeAPI()` - Make API request
- `getClaudeMove()` - Parse response
- `aiMoveWithClaude()` - Execute Claude's move
