---
title: "Tetr.js AI - Play Tetris with AI Auto-play and Claude Integration"
date: 2026-01-23
tags: ["Games", "AI", "JavaScript", "Claude"]
---

A classic Tetris game enhanced with AI capabilities. Watch the AI play automatically using a heuristic-based algorithm, or connect to Claude API for AI-powered gameplay!

## Features

- **Classic Tetris Gameplay**: Full implementation with SRS rotation, hold piece, and 6-piece preview
- **Local AI**: Heuristic-based AI with configurable weights and 2-step lookahead
- **Claude AI Mode**: Optional integration with Anthropic's Claude API
- **Human-like Animation**: Configurable think time and move delays
- **Weight Presets**: Balanced, Conservative, and Aggressive play styles
- **Ghost Piece**: Shows AI's planned final position

## How to Play

### Manual Play
Use keyboard controls:
- **Arrow Keys**: Move left/right/down
- **Space**: Hard drop
- **X/Z**: Rotate right/left
- **C**: Hold piece
- **R**: Retry
- **Esc**: Pause

### AI Auto-play
1. Check "Enable AI Auto-play" on the main menu
2. Click "Play Sprint" or "Play Dig Race"
3. Watch the AI play!

### AI Settings
Click "AI Weights Settings" to configure:
- **Weight Presets**: Choose Balanced, Conservative, or Aggressive
- **Think Time**: Add human-like delays
- **Move Delay**: Control animation speed
- **Hard Drop**: Toggle between hard drop and soft drop

### Claude AI Mode
Want to see Claude play Tetris?
1. Open AI Settings
2. Enable "Use Claude AI"
3. Enter your Anthropic API key
4. Select a model (Sonnet 4 recommended)
5. Watch Claude analyze the board and decide each move!

## Play Now

**[Open Tetris AI](/games/tetris-ai/index.html)**

## How the AI Works

The AI evaluates each possible piece placement using 10 features:
- Landing height, rows cleared, transitions, holes, wells, bumpiness, and more

With 2-step lookahead, it considers both the current piece and the next piece in the preview queue to make smarter decisions.

For Claude AI mode, the board state is converted to text and sent to Claude, which responds with rotation count and target position.

## Technical Details

- Built with vanilla JavaScript and HTML5 Canvas
- No external dependencies (except optional Claude API)
- All calculations run locally in your browser
- [View documentation](/games/tetris-ai/docs/ai-system.md)

Enjoy watching the AI stack!
