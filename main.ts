// Lock the current piece into the board
function lockPiece () {
    for (let n = 0; n <= piece.length - 1; n++) {
        x6 = piece[n][0]
        y6 = piece[n][1]
        if (y6 >= 0 && y6 < 5 && x6 >= 0 && x6 < 5) {
            board[y6][x6] = 1
        }
    }
}
// Check if a given set of cells collides with walls or board
function collides (cells: number[][]) {
    for (let j = 0; j <= cells.length - 1; j++) {
        x4 = cells[j][0]
        y4 = cells[j][1]
        // Out of bounds
        if (x4 < 0 || x4 > 4 || y4 < 0 || y4 > 4) {
            return true
        }
        // Hits fixed block
        if (board[y4][x4] == 1) {
            return true
        }
    }
    return false
}
// Handle game over: show lose + score and stop updating until shake
function handleGameOver () {
    gameOver = true
    basic.clearScreen()
    basic.showIcon(IconNames.No)
    basic.clearScreen()
    basic.showString("S:")
    basic.showNumber(score)
    basic.clearScreen()
}
// Button handlers
input.onButtonPressed(Button.A, function () {
    if (!(gameOver)) {
        // Move left
        movePiece(-1, 0)
    }
})
// Spawn a new random piece at the top
// Length: 1, 2, or 3
// Orientation: horizontal or vertical
function spawnPiece () {
    piece = []
    length = randint(1, 3)
    // 0 = vertical, 1 = horizontal
    vertical = randint(0, 1) == 0
    // Top y will usually be 0; if too long, we shift upwards
    if (vertical) {
        // vertical piece in a column around x = 2
        x5 = 2
        // Build cells
        for (let k = 0; k <= length - 1; k++) {
            let startY = 0
            piece.push([x5, startY + k])
        }
    } else {
        // horizontal piece around the center
        // choose leftmost x so entire piece fits in [0..4]
        // for length 3 -> x in [0..2], for length 2 -> [0..3], for length 1 -> [0..4]
        maxStart = 5 - length
        startX = randint(0, maxStart)
        for (let l = 0; l <= length - 1; l++) {
            let y5 = 0
            piece.push([startX + l, y5])
        }
    }
    // If it collides immediately, game over
    if (collides(piece)) {
        handleGameOver()
    }
}
// Check all rows and clear any that are full
function clearFullRows () {
    for (let y7 = 0; y7 <= 4; y7++) {
        full = true
        for (let x7 = 0; x7 <= 4; x7++) {
            if (board[y7][x7] == 0) {
                full = false
                break;
            }
        }
        if (full) {
            // Increase score for each cleared line
            score += 1
            for (let yy = y7; yy > 0; yy--) {
                for (let xx = 0; xx < 5; xx++) {
                    board[yy][xx] = board[yy - 1][xx]
                }
            }
// Top row becomes empty
            for (let xx2 = 0; xx2 <= 4; xx2++) {
                board[0][xx2] = 0
            }
        }
    }
}
// Draw board + current piece to LEDs
function draw () {
    basic.clearScreen()
    // Draw fixed board
    for (let y2 = 0; y2 <= 4; y2++) {
        for (let x2 = 0; x2 <= 4; x2++) {
            if (board[y2][x2] == 1) {
                led.plot(x2, y2)
            }
        }
    }
    // Draw active piece
    for (let i = 0; i <= piece.length - 1; i++) {
        x3 = piece[i][0]
        y3 = piece[i][1]
        if (x3 >= 0 && x3 < 5 && y3 >= 0 && y3 < 5) {
            led.plot(x3, y3)
        }
    }
}
// Restart the whole game after losing
function restartGame () {
    score = 0
    initBoard()
    spawnPiece()
    gameOver = false
}
input.onButtonPressed(Button.AB, function () {
    if (!(gameOver)) {
        // Soft drop: try to move down multiple times quickly
        for (let index = 0; index < 3; index++) {
            if (!(movePiece(0, 1))) {
                break;
            }
        }
    }
})
input.onButtonPressed(Button.B, function () {
    if (!(gameOver)) {
        // Move right
        movePiece(1, 0)
    }
})
// Initialize 5x5 board with zeros
function initBoard () {
    board = []
    for (let index = 0; index < 5; index++) {
        let row: number[] = []
        for (let index = 0; index < 5; index++) {
            row.push(0)
        }
        board.push(row)
    }
}
// Shake to restart, but ONLY after losing
input.onGesture(Gesture.Shake, function () {
    if (gameOver) {
        restartGame()
    }
})
// === ADDED: rotate current piece around its center ===
// Find center of current piece
function rotatePiece () {
    let rotated: number[][] = []
    if (piece.length == 0) {
        return
    }
    for (let i2 = 0; i2 <= piece.length - 1; i2++) {
        sumX += piece[i2][0]
        sumY += piece[i2][1]
    }
    cx = sumX / piece.length
    cy = sumY / piece.length
    for (let r = 0; r <= piece.length - 1; r++) {
        px = piece[r][0]
        py = piece[r][1]
        // 90° clockwise rotation around (cx, cy)
        rx = Math.round(cx + (py - cy))
        ry = Math.round(cy - (px - cx))
        rotated.push([rx, ry])
    }
    // Apply rotation only if it doesn't collide
    if (!(collides(rotated))) {
        piece = rotated
    }
}
// === ADDED: rotate when logo is pressed ===
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (!(gameOver)) {
        rotatePiece()
    }
})
// Move current piece by (dx, dy) if possible
// returns true if moved, false if blocked
function movePiece (dx: number, dy: number) {
    let moved: number[][] = []
    for (let m = 0; m <= piece.length - 1; m++) {
        moved.push([piece[m][0] + dx, piece[m][1] + dy])
    }
    if (!(collides(moved))) {
        piece = moved
        return true
    }
    return false
}
let ry = 0
let rx = 0
let py = 0
let px = 0
let cy = 0
let cx = 0
let sumY = 0
let sumX = 0
let y3 = 0
let x3 = 0
let full = false
let startX = 0
let maxStart = 0
let x5 = 0
let vertical = false
let length = 0
let gameOver = false
let y4 = 0
let x4 = 0
let y6 = 0
let x6 = 0
let piece: number[][] = []
let score = 0
let board: number[][] = []
// --- Main ---
score = 0
initBoard()
spawnPiece()
basic.forever(function () {
    if (!(gameOver)) {
        // Try to move piece down by 1
        if (!(movePiece(0, 1))) {
            // Can't move: lock and spawn new piece
            lockPiece()
            clearFullRows()
            spawnPiece()
        }
        draw()
    }
    // speed of falling (smaller = faster)
    basic.pause(1000)
})
