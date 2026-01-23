function Piece() {
  this.x;
  this.y;
  this.pos = 0;
  this.tetro;
  this.index;
  this.kickData;
  this.lockDelay = 0;
  this.shiftDelay = 0;
  this.shiftDir;
  this.shiftReleased;
  this.arrDelay = 0;
  this.held = false;
  this.finesse = 0;
  this.dirty = false;
}
/**
 * Removes last active piece, and gets the next active piece from the grab bag.
 */
Piece.prototype.new = function(index) {
  // TODO if no arguments, get next grabbag piece
  this.pos = 0;
  this.tetro = [];
  this.held = false;
  this.finesse = 0;
  this.dirty = true;
  //TODO change this
  landed = false;

  // TODO Do this better. Make clone object func maybe.
  //for property in pieces, this.prop = piece.prop
  this.tetro = pieces[index].tetro;
  this.kickData = pieces[index].kickData;
  this.x = pieces[index].x;
  this.y = pieces[index].y;
  this.index = index;

  // TODO ---------------- snip

  //TODO Do this better. (make grabbag object)
  // Preview.next(); == grabbag.next()
  // Preview.draw();
  //preview.next();

  // Check for blockout.
  if (!this.moveValid(0, 0, this.tetro)) {
    gameState = 9;
    msg.innerHTML = 'BLOCK OUT!';
    menu(3);
  }
};
Piece.prototype.rotate = function(direction) {
  // Rotates tetromino.
  var rotated = [];
  if (direction === -1) {
    for (var i = this.tetro.length - 1; i >= 0; i--) {
      rotated[i] = [];
      for (var row = 0; row < this.tetro.length; row++) {
        rotated[i][this.tetro.length - 1 - row] = this.tetro[row][i];
      }
    }
  } else {
    for (var i = 0; i < this.tetro.length; i++) {
      rotated[i] = [];
      for (var row = this.tetro.length - 1; row >= 0; row--) {
        rotated[i][row] = this.tetro[row][this.tetro.length - 1 - i];
      }
    }
  }

  // Goes thorugh kick data until it finds a valid move.
  var curPos = this.pos.mod(4);
  var newPos = (this.pos + direction).mod(4);

  for (var x = 0, len = this.kickData[0].length; x < len; x++) {
    if (
      this.moveValid(
        this.kickData[curPos][x][0] - this.kickData[newPos][x][0],
        this.kickData[curPos][x][1] - this.kickData[newPos][x][1],
        rotated,
      )
    ) {
      this.x += this.kickData[curPos][x][0] - this.kickData[newPos][x][0];
      this.y += this.kickData[curPos][x][1] - this.kickData[newPos][x][1];
      this.tetro = rotated;
      this.pos = newPos;
      // TODO make 180 rotate count as one or just update finess 180s
      //this.finesse++;
      break;
    }
  }
};
Piece.prototype.checkShift = function() {
  // Shift key pressed event.
  if (keysDown & flags.moveLeft && !(lastKeys & flags.moveLeft)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
    this.finesse++;
  } else if (keysDown & flags.moveRight && !(lastKeys & flags.moveRight)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
    this.finesse++;
  }
  // Shift key released event.
  if (
    this.shiftDir === 1 &&
    !(keysDown & flags.moveRight) &&
    lastKeys & flags.moveRight &&
    keysDown & flags.moveLeft
  ) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
  } else if (
    this.shiftDir === -1 &&
    !(keysDown & flags.moveLeft) &&
    lastKeys & flags.moveLeft &&
    keysDown & flags.moveRight
  ) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
  } else if (
    !(keysDown & flags.moveRight) &&
    lastKeys & flags.moveRight &&
    keysDown & flags.moveLeft
  ) {
    this.shiftDir = -1;
  } else if (
    !(keysDown & flags.moveLeft) &&
    lastKeys & flags.moveLeft &&
    keysDown & flags.moveRight
  ) {
    this.shiftDir = 1;
  } else if (
    (!(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft) ||
    (!(keysDown & flags.moveRight) && lastKeys & flags.moveRight)
  ) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 0;
  }
  // Handle events
  if (this.shiftDir) {
    // 1. When key pressed instantly move over once.
    if (this.shiftReleased) {
      this.shift(this.shiftDir);
      this.shiftDelay++;
      this.shiftReleased = false;
      // 2. Apply DAS delay
    } else if (this.shiftDelay < settings.DAS) {
      this.shiftDelay++;
      // 3. Once the delay is complete, move over once.
      //     Increment delay so this doesn't run again.
    } else if (this.shiftDelay === settings.DAS && settings.DAS !== 0) {
      this.shift(this.shiftDir);
      if (settings.ARR !== 0) this.shiftDelay++;
      // 4. Apply ARR delay
    } else if (this.arrDelay < settings.ARR) {
      this.arrDelay++;
      // 5. If ARR Delay is full, move piece, and reset delay and repeat.
    } else if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
      this.shift(this.shiftDir);
    }
  }
};
Piece.prototype.shift = function(direction) {
  this.arrDelay = 0;
  if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
    for (var i = 1; i < 10; i++) {
      if (!this.moveValid(i * direction, 0, this.tetro)) {
        this.x += i * direction - direction;
        break;
      }
    }
  } else if (this.moveValid(direction, 0, this.tetro)) {
    this.x += direction;
  }
};
Piece.prototype.shiftDown = function() {
  if (this.moveValid(0, 1, this.tetro)) {
    var grav = gravityArr[settings['Soft Drop'] + 1];
    if (grav > 1) this.y += this.getDrop(grav);
    else this.y += grav;
  }
};
Piece.prototype.hardDrop = function() {
  this.y += this.getDrop(20);
  this.lockDelay = settings['Lock Delay'];
};
Piece.prototype.getDrop = function(distance) {
  for (var i = 1; i <= distance; i++) {
    if (!this.moveValid(0, i, this.tetro)) return i - 1;
  }
  return i - 1;
};
Piece.prototype.hold = function() {
  var temp = hold.piece;
  if (!this.held) {
    if (hold.piece !== void 0) {
      hold.piece = this.index;
      this.new(temp);
    } else {
      hold.piece = this.index;
      this.new(preview.next());
    }
    this.held = true;
    hold.draw();
  }
};
/**
 * Checks if position and orientation passed is valid.
 *  We call it for every action instead of only once a frame in case one
 *  of the actions is still valid, we don't want to block it.
 */
Piece.prototype.moveValid = function(cx, cy, tetro) {
  cx = cx + this.x;
  cy = Math.floor(cy + this.y);

  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (
        tetro[x][y] &&
        (cx + x < 0 ||
          cx + x >= 10 ||
          cy + y >= 22 ||
          stack.grid[cx + x][cy + y])
      ) {
        return false;
      }
    }
  }
  this.lockDelay = 0;
  return true;
};
Piece.prototype.update = function() {
  if (this.moveValid(0, 1, this.tetro)) {
    landed = false;
    if (settings.Gravity) {
      var grav = gravityArr[settings.Gravity - 1];
      if (grav > 1) this.y += this.getDrop(grav);
      else this.y += grav;
    } else {
      this.y += gravity;
    }
  } else {
    landed = true;
    this.y = Math.floor(this.y);
    if (this.lockDelay >= settings['Lock Delay']) {
      // Track combo - count lines before and after
      var linesBefore = (typeof lines !== 'undefined') ? lines : 0;
      stack.addPiece(this.tetro);
      var linesAfter = (typeof lines !== 'undefined') ? lines : 0;
      var linesCleared = linesAfter - linesBefore;

      // Update combo count
      if (linesCleared > 0) {
        window.AI_COMBO_COUNT = (window.AI_COMBO_COUNT || 0) + 1;
        if (window.AI_COMBO_COUNT > 1) {
          console.log('[AI] Combo x' + window.AI_COMBO_COUNT + '!');
        }
      } else {
        if (window.AI_COMBO_COUNT > 1) {
          console.log('[AI] Combo ended at x' + window.AI_COMBO_COUNT);
        }
        window.AI_COMBO_COUNT = 0;
      }

      this.new(preview.next());
    } else {
      var a = 1 / setting['Lock Delay'][settings['Lock Delay']];
      activeCtx.globalCompositeOperation = 'source-atop';
      activeCtx.fillStyle = 'rgba(0,0,0,' + a + ')';
      activeCtx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
      activeCtx.globalCompositeOperation = 'source-over';
      this.lockDelay++;
    }
  }
};
Piece.prototype.draw = function() {
  draw(this.tetro, this.x, this.y, activeCtx);
};
Piece.prototype.drawGhost = function() {
  if (landed) return;

  // Use AI planned position if available and AI is enabled
  if (window.aiEnabled && window.AI_PLANNED_MOVE) {
    const plan = window.AI_PLANNED_MOVE;
    if (!settings.Ghost) {
      draw(plan.tetro, plan.x, plan.y, activeCtx, 0);
    } else if (settings.Ghost === 1) {
      activeCtx.globalAlpha = 0.3;
      draw(plan.tetro, plan.x, plan.y, activeCtx);
      activeCtx.globalAlpha = 1;
    }
  } else {
    // Normal ghost (current position drop)
    if (!settings.Ghost) {
      draw(this.tetro, this.x, this.y + this.getDrop(22), activeCtx, 0);
    } else if (settings.Ghost === 1) {
      activeCtx.globalAlpha = 0.3;
      draw(this.tetro, this.x, this.y + this.getDrop(22), activeCtx);
      activeCtx.globalAlpha = 1;
    }
  }
};


// ===================== ADD AI auto play =====================
// Constants
const GRID_WIDTH = 10;
const GRID_HEIGHT = 22;

// AI Configuration
window.aiEnabled = false;
window.AI_SPEED = 5; // moves per second (1-10)
window.AI_LOOKAHEAD_DISCOUNT = 0.5; // discount factor for lookahead
window.AI_THINK_TIME_MIN = 100; // minimum thinking time in ms
window.AI_THINK_TIME_MAX = 500; // maximum thinking time in ms
window.AI_HUMAN_MODE = true; // enable human-like delays
window.AI_MOVE_DELAY = 50; // delay between each move action in ms

// Claude AI Configuration
window.AI_USE_CLAUDE = false; // use Claude API instead of local AI
window.AI_CLAUDE_API_KEY = ''; // Claude API key
window.AI_CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // Claude model to use

// AI planned move (for ghost display)
window.AI_PLANNED_MOVE = null; // { x, y, tetro }

// AI move queue for animated movement
window.AI_MOVE_QUEUE = []; // array of actions: 'rotate', 'left', 'right', 'drop'
window.AI_IS_ANIMATING = false;

// Combo tracking for AI evaluation
window.AI_COMBO_COUNT = 0; // current combo count (consecutive line clears)

// ===================== Claude AI Integration =====================

// Piece names for Claude
const PIECE_NAMES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// Convert grid to text representation for Claude
function gridToText(grid) {
    let text = '';
    for (let y = 2; y < GRID_HEIGHT; y++) { // Start from y=2 (visible area)
        let row = '';
        for (let x = 0; x < GRID_WIDTH; x++) {
            row += grid[x][y] ? '█' : '·';
        }
        text += row + '\n';
    }
    return text;
}

// Convert tetromino to text representation
function tetroToText(tetro) {
    let text = '';
    for (let y = 0; y < tetro.length; y++) {
        let row = '';
        for (let x = 0; x < tetro.length; x++) {
            row += tetro[x][y] ? '█' : '·';
        }
        text += row + '\n';
    }
    return text;
}

// Build prompt for Claude
function buildClaudePrompt(currentPiece, grid, previewPieces, holdPiece) {
    const pieceName = PIECE_NAMES[currentPiece.index] || '?';
    const previewNames = previewPieces.map(i => PIECE_NAMES[i] || '?').join(', ');
    const holdName = holdPiece !== undefined ? PIECE_NAMES[holdPiece] : 'empty';

    const prompt = `You are playing Tetris. Analyze the game state and decide the best move.

CURRENT PIECE: ${pieceName}
${tetroToText(currentPiece.tetro)}

CURRENT BOARD (· = empty, █ = filled):
${gridToText(grid)}

PREVIEW QUEUE: ${previewNames}
HOLD PIECE: ${holdName}

PIECE SPAWN POSITION: x=${currentPiece.x}

RULES:
- Grid is 10 columns (x: 0-9) and 20 visible rows
- You can rotate 0-3 times clockwise
- You can move left/right to position x from -2 to 9
- Goal: Clear lines, avoid holes, keep stack low

Respond with ONLY a JSON object (no other text):
{"rotations": <0-3>, "targetX": <-2 to 9>, "reasoning": "<brief explanation>"}`;

    return prompt;
}

// Call Claude API
async function callClaudeAPI(prompt) {
    const apiKey = window.AI_CLAUDE_API_KEY;
    if (!apiKey) {
        console.error('[Claude] No API key configured');
        return null;
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: window.AI_CLAUDE_MODEL || 'claude-sonnet-4-20250514',
                max_tokens: 256,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Claude] API error:', error);
            return null;
        }

        const data = await response.json();
        const text = data.content[0].text;
        console.log('[Claude] Response:', text);

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error('[Claude] Error:', error);
        return null;
    }
}

// Get move from Claude
async function getClaudeMove(piece, grid) {
    const previewPieces = (typeof preview !== 'undefined' && preview.grabBag)
        ? preview.grabBag.slice(0, 4)
        : [];
    const holdPiece = (typeof hold !== 'undefined') ? hold.piece : undefined;

    const prompt = buildClaudePrompt(piece, grid, previewPieces, holdPiece);
    console.log('[Claude] Sending request...');

    const response = await callClaudeAPI(prompt);
    if (response && typeof response.rotations === 'number' && typeof response.targetX === 'number') {
        console.log('[Claude] Move:', response.rotations, 'rotations, x=' + response.targetX);
        if (response.reasoning) {
            console.log('[Claude] Reasoning:', response.reasoning);
        }
        return {
            rotations: Math.max(0, Math.min(3, response.rotations)),
            targetX: Math.max(-2, Math.min(9, response.targetX))
        };
    }
    return null;
}

// ===================== End Claude AI Integration =====================

// Calculate column heights (cached for performance)
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

// Calculate aggregate height (sum of all column heights)
function calculateAggregateHeight(grid, heights) {
    if (!heights) heights = calculateColumnHeights(grid);
    let sum = 0;
    for (let i = 0; i < heights.length; i++) {
        sum += heights[i];
    }
    return sum;
}

// Calculate landing height - now uses actual piece landing Y coordinate
function calculateLandingHeight(landingY, tetro) {
    // Calculate the center of the piece vertically
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
    // Return height from bottom (inverted Y)
    return GRID_HEIGHT - (minY + maxY) / 2;
}

// calculate rows cleared
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

// calculate row transitions
function calculateRowTransitions(grid) {
    let transitions = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        let prev = 1; // border
        for (let x = 0; x < GRID_WIDTH; x++) {
            const current = grid[x][y] ? 1 : 0;
            if (current !== prev) transitions++;
            prev = current;
        }
        if (prev === 0) transitions++;
    }
    return transitions;
}

// calculate column transitions
function calculateColumnTransitions(grid) {
    let transitions = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        let prev = 1;
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const current = grid[x][y] ? 1 : 0;
            if (current !== prev) transitions++;
            prev = current;
        }
    }
    return transitions;
}

// calculate holes
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

// calculate covered cells (blocks above holes)
function calculateCoveredCells(grid) {
    let covered = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        let holeFound = false;
        // Scan from bottom to top
        for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
            if (!grid[x][y]) {
                // Check if there's a block above this empty cell
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

// calculate hole depth
function calculateHoleDepth(grid) {
    let totalDepth = 0;
    for (let x = 0; x < GRID_WIDTH; x++) {
        let maxDepth = 0;
        let currentDepth = 0;
        let blockFound = false;

        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y]) {
                blockFound = true;
                currentDepth = 0;
            } else if (blockFound) {
                currentDepth++;
                if (currentDepth > maxDepth) maxDepth = currentDepth;
            }
        }
        totalDepth += maxDepth;
    }
    return totalDepth;
}

// calculate well sums
function calculateWellSums(grid) {
    let wellSums = 0;
    // check leftmost well
    for (let y = 0; y < GRID_HEIGHT; y++) {
        if (!grid[0][y] && grid[1][y]) {
            let depth = 1;
            while (y + depth < GRID_HEIGHT && !grid[0][y + depth]) depth++;
            wellSums += depth;
        }
    }

    // check middle wells
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (!grid[x][y] && grid[x - 1][y] && grid[x + 1][y]) {
                let depth = 1;
                while (y + depth < GRID_HEIGHT && !grid[x][y + depth]) depth++;
                wellSums += depth;
            }
        }
    }

    // check rightmost well
    for (let y = 0; y < GRID_HEIGHT; y++) {
        if (!grid[GRID_WIDTH - 1][y] && grid[GRID_WIDTH - 2][y]) {
            let depth = 1;
            while (y + depth < GRID_HEIGHT && !grid[GRID_WIDTH - 1][y + depth]) depth++;
            wellSums += depth;
        }
    }

    return wellSums;
}

// calculate bumpiness (uses pre-calculated heights if provided)
function calculateBumpiness(grid, heights) {
    if (!heights) heights = calculateColumnHeights(grid);
    let bumpiness = 0;
    for (let i = 0; i < heights.length - 1; i++) {
        bumpiness += Math.abs(heights[i] - heights[i + 1]);
    }
    return bumpiness;
}

// T-Spin detection
// T-piece index is 5, T-Spin requires 3+ corners filled around T center
function detectTSpin(grid, pieceIndex, tetro, x, y, rowsCleared) {
    // Only T-piece can T-Spin
    if (pieceIndex !== 5) return { isTSpin: false, isMini: false };
    if (rowsCleared === 0) return { isTSpin: false, isMini: false };

    // T-piece center is at (1,1) in its 3x3 bounding box
    const cx = x + 1;
    const cy = y + 1;

    // Check 4 corners around T center
    const corners = [
        { x: cx - 1, y: cy - 1 }, // top-left
        { x: cx + 1, y: cy - 1 }, // top-right
        { x: cx - 1, y: cy + 1 }, // bottom-left
        { x: cx + 1, y: cy + 1 }  // bottom-right
    ];

    let filledCorners = 0;
    let frontCornersFilled = 0; // corners in front of T (depends on rotation)

    for (let i = 0; i < corners.length; i++) {
        const corner = corners[i];
        // Out of bounds counts as filled
        if (corner.x < 0 || corner.x >= GRID_WIDTH ||
            corner.y < 0 || corner.y >= GRID_HEIGHT ||
            grid[corner.x][corner.y]) {
            filledCorners++;
            // Front corners are the two corners where T points
            // For simplicity, count top corners as front (covers most T-spin cases)
            if (i < 2) frontCornersFilled++;
        }
    }

    // T-Spin: 3+ corners filled
    // T-Spin Mini: 3 corners but only 1 front corner
    if (filledCorners >= 3) {
        const isMini = (filledCorners === 3 && frontCornersFilled < 2);
        return { isTSpin: true, isMini: isMini };
    }

    return { isTSpin: false, isMini: false };
}

// Weight presets - tuned for stable play
const AI_WEIGHT_PRESETS = {
    balanced: {
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
    },
    conservative: {
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
    },
    aggressive: {
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
};

// Initialize default weights
if (window.AI_WEIGHTS === undefined) {
    window.AI_WEIGHTS = Object.assign({}, AI_WEIGHT_PRESETS.balanced);
}

// AI evaluate function
// Parameters:
//   grid - board state after placement
//   landingY - Y position where piece landed
//   tetro - tetromino shape
//   pieceIndex - piece type index (0-6)
//   x - X position of placement
//   simulatedCombo - optional simulated combo count for lookahead (if undefined, uses actual)
// Returns: { score, linesCleared } for combo simulation in lookahead
function aiEvaluate(grid, landingY, tetro, pieceIndex, x, simulatedCombo) {
    // Pre-calculate column heights for reuse
    const heights = calculateColumnHeights(grid);

    // Calculate all features
    const landingHeight = (landingY !== undefined && tetro)
        ? calculateLandingHeight(landingY, tetro)
        : calculateAggregateHeight(grid, heights) / GRID_WIDTH; // fallback
    const rowsCleared = calculateRowsCleared(grid);
    const rowTransitions = calculateRowTransitions(grid);
    const columnTransitions = calculateColumnTransitions(grid);
    const holes = calculateHoles(grid);
    const wellSums = calculateWellSums(grid);
    const bumpiness = calculateBumpiness(grid, heights);
    const holeDepth = calculateHoleDepth(grid);
    const aggregateHeight = calculateAggregateHeight(grid, heights);
    const coveredCells = calculateCoveredCells(grid);

    // T-Spin detection (needs original grid before line clear for accurate corner check)
    let tSpinBonus = 0;
    if (pieceIndex === 5 && x !== undefined && landingY !== undefined) {
        const tSpinResult = detectTSpin(grid, pieceIndex, tetro, x, landingY, rowsCleared);
        if (tSpinResult.isTSpin) {
            const w = window.AI_WEIGHTS;
            if (tSpinResult.isMini) {
                tSpinBonus = (w.tSpinMini || 1) * rowsCleared;
            } else {
                tSpinBonus = (w.tSpin || 4) * rowsCleared;
            }
        }
    }

    // Combo bonus calculation
    // Use simulated combo for lookahead, or actual combo for current move
    let comboBonus = 0;
    const currentCombo = (simulatedCombo !== undefined) ? simulatedCombo : (window.AI_COMBO_COUNT || 0);
    const w = window.AI_WEIGHTS;
    if (rowsCleared > 0 && (w.combo || 0) > 0) {
        // Combo bonus = weight * (comboCount + 1) * linesCleared
        // This rewards continuing combos
        comboBonus = (w.combo || 1) * (currentCombo + 1) * rowsCleared;
    }

    // Sum up the weighted scores
    const score = (
        w.landingHeight * landingHeight +
        w.rowsCleared * rowsCleared +
        w.rowTransitions * rowTransitions +
        w.columnTransitions * columnTransitions +
        w.holes * holes +
        w.wellSums * wellSums +
        w.bumpiness * bumpiness +
        w.holeDepth * holeDepth +
        (w.aggregateHeight || 0) * aggregateHeight +
        (w.coveredCells || 0) * coveredCells +
        tSpinBonus +
        comboBonus
    );

    // Return object with score and linesCleared for combo simulation in lookahead
    return { score: score, linesCleared: rowsCleared };
}

// Quick hole count for early pruning (faster than full calculation)
function quickHoleCount(grid, tetro, x, y) {
    let newHoles = 0;
    for (let dx = 0; dx < tetro.length; dx++) {
        for (let dy = 0; dy < tetro[dx].length; dy++) {
            if (tetro[dx][dy]) {
                const gx = x + dx;
                const gy = y + dy;
                // Check cells below this mino for potential holes
                for (let below = gy + 1; below < GRID_HEIGHT; below++) {
                    if (!grid[gx][below]) newHoles++;
                    else break;
                }
            }
        }
    }
    return newHoles;
}

// clone current grid
function aiCloneGrid(grid) {
    const newGrid = new Array(GRID_WIDTH);
    for (let x = 0; x < GRID_WIDTH; x++) {
        newGrid[x] = grid[x].slice();
    }
    return newGrid;
}

// simulate a tetromino placement on the grid - now returns { grid, landingY }
function aiSimulate(grid, tetro, x, y) {
    const newGrid = aiCloneGrid(grid);
    const landingY = y;

    // Place the tetromino
    for (let dx = 0; dx < tetro.length; dx++) {
        for (let dy = 0; dy < tetro[dx].length; dy++) {
            if (tetro[dx][dy]) {
                const gx = x + dx, gy = y + dy;
                if (gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT) {
                    newGrid[gx][gy] = tetro[dx][dy];
                }
            }
        }
    }

    // Clear full rows
    for (let row = 0; row < GRID_HEIGHT; row++) {
        let full = true;
        for (let col = 0; col < GRID_WIDTH; col++) {
            if (!newGrid[col][row]) { full = false; break; }
        }
        if (full) {
            for (let ty = row; ty > 0; ty--) {
                for (let col = 0; col < GRID_WIDTH; col++) {
                    newGrid[col][ty] = newGrid[col][ty - 1];
                }
            }
            for (let col = 0; col < GRID_WIDTH; col++) newGrid[col][0] = 0;
        }
    }

    return { grid: newGrid, landingY: landingY };
}

// Bit hash for tetromino (faster than JSON.stringify)
function tetroHash(tetro) {
    let hash = 0;
    for (let x = 0; x < tetro.length; x++) {
        for (let y = 0; y < tetro[x].length; y++) {
            hash = (hash << 1) | (tetro[x][y] ? 1 : 0);
        }
    }
    return hash;
}

// Rotate tetro using EXACT same algorithm as game (direction=1, clockwise)
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

// get all rotations of a tetromino - uses bit hash for dedup
function aiGetAllRotations(tetro) {
    const rots = [tetro];
    const seen = new Set([tetroHash(tetro)]);
    let cur = tetro;

    for (let i = 1; i < 4; i++) {
        // Use same rotation as game
        const next = rotateTetroClockwise(cur);
        const hash = tetroHash(next);
        if (!seen.has(hash)) {
            seen.add(hash);
            rots.push(next);
        }
        cur = next;
    }
    return rots;
}

// Check if a move is valid in simulation
Piece.prototype.moveValidSim = function(x, y, tetro, grid) {
    for (let dx = 0; dx < tetro.length; dx++) {
        for (let dy = 0; dy < tetro[dx].length; dy++) {
            if (tetro[dx][dy] &&
                (x + dx < 0 || x + dx >= GRID_WIDTH ||
                 y + dy >= GRID_HEIGHT || y + dy < 0 ||
                 grid[x + dx][y + dy])) {
                return false;
            }
        }
    }
    return true;
};

// Get all possible placements for a tetromino
function getAllPlacements(tetro, grid, moveValidSim) {
    const placements = [];
    const rots = aiGetAllRotations(tetro);

    for (let r = 0; r < rots.length; r++) {
        const rotTetro = rots[r];
        for (let x = -2; x < GRID_WIDTH; x++) {
            let y = 0;
            // Drop to landing position
            while (moveValidSim(x, y + 1, rotTetro, grid)) {
                y++;
                if (y > GRID_HEIGHT) break;
            }
            if (!moveValidSim(x, y, rotTetro, grid)) continue;
            placements.push({ x, y, r, tetro: rotTetro });
        }
    }
    return placements;
}

// Evaluate a single placement (used for lookahead)
// Returns { score, linesCleared } or { score: -Infinity, linesCleared: 0 } if pruned
function evaluatePlacement(grid, placement, enablePruning, pieceIndex, simulatedCombo) {
    const { x, y, tetro } = placement;

    // Early pruning: skip if placement creates too many holes
    if (enablePruning) {
        const quickHoles = quickHoleCount(grid, tetro, x, y);
        if (quickHoles > 3) return { score: -Infinity, linesCleared: 0 };
    }

    const result = aiSimulate(grid, tetro, x, y);
    return aiEvaluate(result.grid, result.landingY, tetro, pieceIndex, x, simulatedCombo);
}

// Find best placement for a grid state (no lookahead)
function findBestPlacement(tetro, grid, moveValidSim, enablePruning, pieceIndex, simulatedCombo) {
    const placements = getAllPlacements(tetro, grid, moveValidSim);
    let best = null;
    let bestScore = -Infinity;
    let bestLinesCleared = 0;

    for (const placement of placements) {
        const evalResult = evaluatePlacement(grid, placement, enablePruning, pieceIndex, simulatedCombo);
        if (evalResult.score > bestScore) {
            bestScore = evalResult.score;
            bestLinesCleared = evalResult.linesCleared;
            best = placement;
        }
    }
    return { placement: best, score: bestScore, linesCleared: bestLinesCleared };
}

// AI: find the best move with 2-step lookahead
// Now simulates combo state for lookahead evaluation
Piece.prototype.getBestMoveWithLookahead = function(nextPieceIndex) {
    const grid = stack.grid;
    const placements = getAllPlacements(this.tetro, grid, this.moveValidSim.bind(this));
    let best = null;
    let bestScore = -Infinity;

    // Current combo count for evaluation
    const currentCombo = window.AI_COMBO_COUNT || 0;

    // Get next piece tetromino
    const nextTetro = (nextPieceIndex !== undefined && pieces[nextPieceIndex])
        ? pieces[nextPieceIndex].tetro
        : null;

    for (const placement of placements) {
        const { x, y, tetro } = placement;

        // Early pruning
        const quickHoles = quickHoleCount(grid, tetro, x, y);
        if (quickHoles > 3) continue;

        const result = aiSimulate(grid, tetro, x, y);
        // Evaluate current placement with current combo
        const evalResult = aiEvaluate(result.grid, result.landingY, tetro, this.index, x, currentCombo);
        let score = evalResult.score;

        // 2-step lookahead: evaluate best move for next piece
        if (nextTetro) {
            // Calculate simulated combo for next piece:
            // If current placement clears lines, combo continues (combo + 1)
            // If not, combo resets to 0
            const nextCombo = (evalResult.linesCleared > 0) ? (currentCombo + 1) : 0;

            const nextResult = findBestPlacement(
                nextTetro,
                result.grid,
                this.moveValidSim.bind(this),
                true,
                nextPieceIndex,
                nextCombo  // Pass simulated combo to lookahead
            );
            if (nextResult.score !== -Infinity) {
                score += window.AI_LOOKAHEAD_DISCOUNT * nextResult.score;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            best = placement;
        }
    }
    return best;
};

// AI: find the best move for the current piece (simple version, no lookahead)
Piece.prototype.getBestMove = function() {
    const currentCombo = window.AI_COMBO_COUNT || 0;
    const result = findBestPlacement(
        this.tetro,
        stack.grid,
        this.moveValidSim.bind(this),
        true,
        this.index,
        currentCombo
    );
    return result.placement;
};

// Evaluate if using hold would be better
Piece.prototype.shouldUseHold = function() {
    if (this.held) return false; // Already held this turn
    if (typeof hold === 'undefined') return false;

    const grid = stack.grid;
    const currentCombo = window.AI_COMBO_COUNT || 0;
    const nextPieceIndex = (typeof preview !== 'undefined' && preview.grabBag && preview.grabBag.length > 0)
        ? preview.grabBag[0]
        : undefined;

    // Score for current piece
    const currentMove = this.getBestMoveWithLookahead(nextPieceIndex);
    const currentEval = currentMove
        ? evaluatePlacement(grid, currentMove, false, this.index, currentCombo)
        : { score: -Infinity, linesCleared: 0 };
    const currentScore = currentEval.score;

    // Score for hold piece (or next piece if hold is empty)
    let holdPieceIndex;
    if (hold.piece !== undefined) {
        holdPieceIndex = hold.piece;
    } else if (nextPieceIndex !== undefined) {
        holdPieceIndex = nextPieceIndex;
    } else {
        return false;
    }

    const holdTetro = pieces[holdPieceIndex].tetro;
    const holdResult = findBestPlacement(
        holdTetro,
        grid,
        this.moveValidSim.bind(this),
        true,
        holdPieceIndex,
        currentCombo
    );

    // Use hold if it gives significantly better score
    return holdResult.score > currentScore + 0.5;
};

// Compare two tetromino shapes
function tetroEquals(t1, t2) {
    if (t1.length !== t2.length) return false;
    for (let x = 0; x < t1.length; x++) {
        if (t1[x].length !== t2[x].length) return false;
        for (let y = 0; y < t1[x].length; y++) {
            if ((t1[x][y] ? 1 : 0) !== (t2[x][y] ? 1 : 0)) return false;
        }
    }
    return true;
}

// Find how many rotations needed to match target shape
function findRotationCount(startTetro, targetTetro, rotateFn) {
    let current = startTetro;
    for (let r = 0; r < 4; r++) {
        if (tetroEquals(current, targetTetro)) return r;
        // Rotate 90 degrees clockwise (same as aiGetAllRotations)
        const next = [];
        for (let x = 0; x < current.length; x++) {
            next[x] = [];
            for (let y = 0; y < current.length; y++) {
                next[x][y] = current[current.length - 1 - y][x];
            }
        }
        current = next;
    }
    return 0; // Fallback
}

// Flag to prevent recursive AI calls during hold
let aiIsProcessing = false;
let aiProcessingTimeout = null;

// AI move function - simplified and robust version
Piece.prototype.aiMove = function() {
    // Prevent recursive calls (especially from hold)
    if (aiIsProcessing) {
        console.log('[AI] Skipping - already processing');
        return;
    }
    aiIsProcessing = true;

    // Safety timeout to reset flag if something goes wrong (10 seconds for Claude)
    if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
    aiProcessingTimeout = setTimeout(() => {
        if (aiIsProcessing) {
            console.log('[AI] Safety timeout - resetting processing flag');
            aiIsProcessing = false;
            window.AI_IS_ANIMATING = false;
        }
    }, window.AI_USE_CLAUDE ? 10000 : 5000);

    console.log('[AI] aiMove called, piece index=' + this.index + ', x=' + this.x);

    // Use Claude AI if enabled
    if (window.AI_USE_CLAUDE && window.AI_CLAUDE_API_KEY) {
        this.aiMoveWithClaude();
        return;
    }

    // Check if we should use hold
    if (this.shouldUseHold()) {
        console.log('[AI] Using HOLD - better piece available');
        aiIsProcessing = false; // Reset flag before hold (new piece will trigger new aiMove)
        if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
        this.hold();
        return;
    }

    const grid = stack.grid;
    const currentCombo = window.AI_COMBO_COUNT || 0;
    let bestScore = -Infinity;
    let bestRotations = 0;
    let bestX = this.x;
    let validPlacements = 0;

    // Deep copy original tetro
    const originalTetro = [];
    for (let i = 0; i < this.tetro.length; i++) {
        originalTetro[i] = this.tetro[i].slice();
    }

    // Try each rotation count (0, 1, 2, 3)
    for (let rotCount = 0; rotCount < 4; rotCount++) {
        // Generate rotated tetro by rotating rotCount times (using game's algorithm)
        let testTetro = originalTetro;
        for (let r = 0; r < rotCount; r++) {
            testTetro = rotateTetroClockwise(testTetro);
        }

        // Try each X position with this rotation
        for (let testX = -2; testX < GRID_WIDTH; testX++) {
            // Find landing Y
            let testY = 0;
            while (this.moveValidSim(testX, testY + 1, testTetro, grid)) {
                testY++;
                if (testY > GRID_HEIGHT) break;
            }

            // Check if valid position
            if (!this.moveValidSim(testX, testY, testTetro, grid)) continue;

            // Evaluate this placement
            const result = aiSimulate(grid, testTetro, testX, testY);
            const evalResult = aiEvaluate(result.grid, result.landingY, testTetro, this.index, testX, currentCombo);
            const score = evalResult.score;

            validPlacements++;
            if (score > bestScore) {
                bestScore = score;
                bestRotations = rotCount;
                bestX = testX;
            }
        }
    }

    console.log('[AI] Found ' + validPlacements + ' valid placements. Best: rot=' + bestRotations + ', x=' + bestX + ', score=' + bestScore.toFixed(2));

    // If no valid placements found, don't move
    if (validPlacements === 0) {
        console.log('[AI] WARNING: No valid placements found!');
        window.AI_PLANNED_MOVE = null;
        aiIsProcessing = false;
        return;
    }

    // Calculate the planned final position for ghost display
    let plannedTetro = originalTetro;
    for (let r = 0; r < bestRotations; r++) {
        plannedTetro = rotateTetroClockwise(plannedTetro);
    }
    let plannedY = 0;
    while (this.moveValidSim(bestX, plannedY + 1, plannedTetro, grid)) {
        plannedY++;
        if (plannedY > GRID_HEIGHT) break;
    }
    window.AI_PLANNED_MOVE = {
        x: bestX,
        y: plannedY,
        tetro: plannedTetro
    };

    // Store target state for animated movement
    const targetRotations = bestRotations;
    const targetX = bestX;
    let currentRotations = 0;
    const self = this;

    // Animate one step toward target
    const animateStep = () => {
        // Check game state
        if (typeof gameState === 'undefined' || gameState !== 0 || paused || landed) {
            window.AI_IS_ANIMATING = false;
            window.AI_PLANNED_MOVE = null;
            aiIsProcessing = false;
            if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
            return;
        }

        // Step 1: Complete all rotations first
        if (currentRotations < targetRotations) {
            self.rotate(1);
            currentRotations++;

            // Update planned move after rotation
            let plannedY = Math.floor(self.y);
            while (self.moveValidSim(targetX, plannedY + 1, self.tetro, stack.grid)) {
                plannedY++;
                if (plannedY > GRID_HEIGHT) break;
            }
            window.AI_PLANNED_MOVE = { x: targetX, y: plannedY, tetro: self.tetro };

            const delay = window.AI_MOVE_DELAY || 50;
            setTimeout(animateStep, delay);
            return;
        }

        // Step 2: Move horizontally toward target
        if (self.x < targetX) {
            if (self.moveValid(1, 0, self.tetro)) {
                self.x += 1;
            }
            if (self.x < targetX) {
                const delay = window.AI_MOVE_DELAY || 50;
                setTimeout(animateStep, delay);
                return;
            }
        } else if (self.x > targetX) {
            if (self.moveValid(-1, 0, self.tetro)) {
                self.x -= 1;
            }
            if (self.x > targetX) {
                const delay = window.AI_MOVE_DELAY || 50;
                setTimeout(animateStep, delay);
                return;
            }
        }

        // Step 3: All moves done, drop the piece
        if (window.AI_HARDDROP_ONLY) {
            self.hardDrop();
            window.AI_IS_ANIMATING = false;
            window.AI_PLANNED_MOVE = null;
            aiIsProcessing = false;
            if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
        } else {
            // Use soft drop (down arrow) to accelerate
            const softDropStep = () => {
                if (typeof gameState === 'undefined' || gameState !== 0 || paused || landed) {
                    window.AI_IS_ANIMATING = false;
                    window.AI_PLANNED_MOVE = null;
                    aiIsProcessing = false;
                    if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
                    return;
                }

                // Move down one step
                if (self.moveValid(0, 1, self.tetro)) {
                    self.y += 1;
                    const delay = window.AI_MOVE_DELAY || 50;
                    setTimeout(softDropStep, delay / 2); // Faster soft drop
                } else {
                    // Landed - piece will lock naturally via game's lock delay
                    window.AI_IS_ANIMATING = false;
                    window.AI_PLANNED_MOVE = null;
                    aiIsProcessing = false;
                    if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
                }
            };
            softDropStep();
        }
    };

    // Start animation with optional thinking delay
    window.AI_IS_ANIMATING = true;

    if (window.AI_HUMAN_MODE) {
        const minTime = window.AI_THINK_TIME_MIN || 100;
        const maxTime = window.AI_THINK_TIME_MAX || 500;
        const thinkTime = minTime + Math.random() * (maxTime - minTime);
        setTimeout(animateStep, thinkTime);
    } else {
        animateStep();
    }
};

// Override Piece.prototype.new to automatically call aiMove if AI is enabled
const origNew = Piece.prototype.new;
Piece.prototype.new = function(index) {
    // Clear planned move when new piece spawns
    window.AI_PLANNED_MOVE = null;
    window.AI_IS_ANIMATING = false;

    origNew.call(this, index);
    if (window.aiEnabled && typeof gameState !== 'undefined' && gameState === 0) {
        const self = this;

        // Accelerate piece into view using soft drop, then call aiMove
        const bringIntoView = () => {
            if (typeof gameState === 'undefined' || gameState !== 0 || paused || landed) {
                return;
            }

            // Check if piece is visible (y >= 2 means visible on screen)
            if (self.y >= 2) {
                console.log('[AI] Piece visible at y=' + self.y + ', calling aiMove');
                self.aiMove();
            } else {
                // Use soft drop to accelerate into view
                if (self.moveValid(0, 1, self.tetro)) {
                    self.y += 1;
                }
                // Continue until visible
                const delay = window.AI_MOVE_DELAY || 50;
                setTimeout(bringIntoView, delay / 2);
            }
        };

        // Start immediately
        setTimeout(bringIntoView, 20);
    }
};

// Claude AI move function
Piece.prototype.aiMoveWithClaude = async function() {
    const self = this;
    const grid = stack.grid;

    try {
        const claudeMove = await getClaudeMove(this, grid);

        if (!claudeMove) {
            console.log('[Claude] No valid response, falling back to local AI');
            aiIsProcessing = false;
            // Fall back to local AI
            this.aiMove();
            return;
        }

        const targetRotations = claudeMove.rotations;
        const targetX = claudeMove.targetX;

        // Calculate planned position for ghost
        let plannedTetro = [];
        for (let i = 0; i < this.tetro.length; i++) {
            plannedTetro[i] = this.tetro[i].slice();
        }
        for (let r = 0; r < targetRotations; r++) {
            plannedTetro = rotateTetroClockwise(plannedTetro);
        }
        let plannedY = Math.floor(this.y);
        while (this.moveValidSim(targetX, plannedY + 1, plannedTetro, grid)) {
            plannedY++;
            if (plannedY > GRID_HEIGHT) break;
        }
        window.AI_PLANNED_MOVE = { x: targetX, y: plannedY, tetro: plannedTetro };

        // Execute move with animation (same as local AI)
        let currentRotations = 0;

        const animateStep = () => {
            if (typeof gameState === 'undefined' || gameState !== 0 || paused || landed) {
                window.AI_IS_ANIMATING = false;
                window.AI_PLANNED_MOVE = null;
                aiIsProcessing = false;
                if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
                return;
            }

            // Step 1: Complete all rotations first
            if (currentRotations < targetRotations) {
                self.rotate(1);
                currentRotations++;

                let newPlannedY = Math.floor(self.y);
                while (self.moveValidSim(targetX, newPlannedY + 1, self.tetro, grid)) {
                    newPlannedY++;
                    if (newPlannedY > GRID_HEIGHT) break;
                }
                window.AI_PLANNED_MOVE = { x: targetX, y: newPlannedY, tetro: self.tetro };

                const delay = window.AI_MOVE_DELAY || 50;
                setTimeout(animateStep, delay);
                return;
            }

            // Step 2: Move horizontally toward target
            if (self.x < targetX) {
                if (self.moveValid(1, 0, self.tetro)) {
                    self.x += 1;
                }
                if (self.x < targetX) {
                    const delay = window.AI_MOVE_DELAY || 50;
                    setTimeout(animateStep, delay);
                    return;
                }
            } else if (self.x > targetX) {
                if (self.moveValid(-1, 0, self.tetro)) {
                    self.x -= 1;
                }
                if (self.x > targetX) {
                    const delay = window.AI_MOVE_DELAY || 50;
                    setTimeout(animateStep, delay);
                    return;
                }
            }

            // Step 3: All moves done, drop the piece
            if (window.AI_HARDDROP_ONLY) {
                self.hardDrop();
                window.AI_IS_ANIMATING = false;
                window.AI_PLANNED_MOVE = null;
                aiIsProcessing = false;
                if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
            } else {
                // Use soft drop
                const softDropStep = () => {
                    if (typeof gameState === 'undefined' || gameState !== 0 || paused || landed) {
                        window.AI_IS_ANIMATING = false;
                        window.AI_PLANNED_MOVE = null;
                        aiIsProcessing = false;
                        if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
                        return;
                    }
                    if (self.moveValid(0, 1, self.tetro)) {
                        self.y += 1;
                        const delay = window.AI_MOVE_DELAY || 50;
                        setTimeout(softDropStep, delay / 2);
                    } else {
                        window.AI_IS_ANIMATING = false;
                        window.AI_PLANNED_MOVE = null;
                        aiIsProcessing = false;
                        if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
                    }
                };
                softDropStep();
            }
        };

        // Start animation with thinking delay
        window.AI_IS_ANIMATING = true;
        if (window.AI_HUMAN_MODE) {
            const minTime = window.AI_THINK_TIME_MIN || 100;
            const maxTime = window.AI_THINK_TIME_MAX || 500;
            const thinkTime = minTime + Math.random() * (maxTime - minTime);
            setTimeout(animateStep, thinkTime);
        } else {
            animateStep();
        }

    } catch (error) {
        console.error('[Claude] Error in aiMoveWithClaude:', error);
        aiIsProcessing = false;
        window.AI_IS_ANIMATING = false;
        if (aiProcessingTimeout) clearTimeout(aiProcessingTimeout);
    }
};

// AI loop disabled - using event-driven approach via Piece.prototype.new override
// The AI is triggered when a new piece spawns and waits for it to be visible

// Export presets for UI
window.AI_WEIGHT_PRESETS = AI_WEIGHT_PRESETS;
// ===================== END AI auto play =====================

var piece = new Piece();