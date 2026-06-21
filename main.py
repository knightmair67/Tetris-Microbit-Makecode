"""

Current piece cells as array of [x,y]

"""
# Lock the current piece into the board
def lockPiece():
    global x6, y6
    n = 0
    while n <= len(piece) - 1:
        x6 = piece[n][0]
        y6 = piece[n][1]
        if y6 >= 0 and y6 < 5 and x6 >= 0 and x6 < 5:
            board[y6][x6] = 1
        n += 1
# Check if a given set of cells collides with walls or board
def collides(cells: List[List[number]]):
    global x4, y4
    j = 0
    while j <= len(cells) - 1:
        x4 = cells[j][0]
        y4 = cells[j][1]
        # Out of bounds
        if x4 < 0 or x4 > 4 or y4 < 0 or y4 > 4:
            return True
        # Hits fixed block
        if board[y4][x4] == 1:
            return True
        j += 1
    return False
# Button handlers

def on_button_pressed_a():
    # Move left
    movePiece(-1, 0)
input.on_button_pressed(Button.A, on_button_pressed_a)

# Spawn a new random piece at the top
# Length: 1, 2, or 3
# Orientation: horizontal or vertical
def spawnPiece():
    global piece, length, vertical, x5, maxStart, startX
    piece = []
    length = randint(1, 3)
    # 0 = vertical, 1 = horizontal
    vertical = randint(0, 1) == 0
    # Top y will usually be 0; if too long, we shift upwards
    if vertical:
        # vertical piece in a column around x = 2
        x5 = 2
        # Build cells
        k = 0
        while k <= length - 1:
            startY = 0
            piece.append([x5, startY + k])
            k += 1
    else:
        # horizontal piece around the center
        # choose leftmost x so entire piece fits in [0..4]
        # for length 3 -> x in [0..2], for length 2 -> [0..3], for length 1 -> [0..4]
        maxStart = 5 - length
        startX = randint(0, maxStart)
        l = 0
        while l <= length - 1:
            y5 = 0
            piece.append([startX + l, y5])
            l += 1
    # If it collides immediately, game over: clear board and restart
    if collides(piece):
        basic.show_icon(IconNames.SAD)
        basic.pause(500)
        initBoard()
# Check all rows and clear any that are full
def clearFullRows():
    global full
    for y7 in range(5):
        full = True
        for x7 in range(5):
            if board[y7][x7] == 0:
                full = False
                break
        if full:
            yy = y7
            while yy > 0:
                for xx in range(5):
                    board[yy][xx] = board[yy - 1][xx]
                yy -= 1
            # Top row becomes empty
            for xx2 in range(5):
                board[0][xx2] = 0
# Draw board + current piece to LEDs
def draw():
    global x3, y3
    basic.clear_screen()
    # Draw fixed board
    for y2 in range(5):
        for x2 in range(5):
            if board[y2][x2] == 1:
                led.plot(x2, y2)
    # Draw active piece
    i = 0
    while i <= len(piece) - 1:
        x3 = piece[i][0]
        y3 = piece[i][1]
        if x3 >= 0 and x3 < 5 and y3 >= 0 and y3 < 5:
            led.plot(x3, y3)
        i += 1

def on_button_pressed_ab():
    # Soft drop: try to move down multiple times quickly
    for index in range(3):
        if not (movePiece(0, 1)):
            break
input.on_button_pressed(Button.AB, on_button_pressed_ab)

def on_button_pressed_b():
    # Move right
    movePiece(1, 0)
input.on_button_pressed(Button.B, on_button_pressed_b)

# Initialize 5x5 board with zeros
def initBoard():
    global board
    board = []
    for index2 in range(5):
        row: List[number] = []
        for index3 in range(5):
            row.append(0)
        board.append(row)
# Move current piece by (dx, dy) if possible
# returns true if moved, false if blocked
def movePiece(dx: number, dy: number):
    global piece
    moved: List[List[number]] = []
    m = 0
    while m <= len(piece) - 1:
        moved.append([piece[m][0] + dx, piece[m][1] + dy])
        m += 1
    if not (collides(moved)):
        piece = moved
        return True
    return False
y3 = 0
x3 = 0
full = False
startX = 0
maxStart = 0
x5 = 0
vertical = False
length = 0
y4 = 0
x4 = 0
y6 = 0
x6 = 0
piece: List[List[number]] = []
# Simple micro:bit Tetris-like game
# Pieces are 1, 2, or 3 LEDs, random horizontal/vertical
# No manual rotation; random rotation on spawn
# Clear full rows like classic Tetris
# Board[y][x] where 0 <= x,y < 5
board: List[List[number]] = []
# Main game loop
initBoard()
spawnPiece()

def on_forever():
    # Try to move piece down by 1
    if not (movePiece(0, 1)):
        # Can't move: lock and spawn new piece
        lockPiece()
        clearFullRows()
        spawnPiece()
    draw()
    # speed of falling (smaller = faster)
    basic.pause(600)
basic.forever(on_forever)
