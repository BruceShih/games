import type { BaseGameConfig } from './game'
import { BaseGameDifficulty, BaseGameState, IBaseGame } from './game'

export interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

export interface MinesweeperGameConfig extends BaseGameConfig {
  width: number
  height: number
  mines: number
}

export class Minesweeper extends IBaseGame {
  private board: Cell[][]
  private width: number
  private height: number
  private totalMines: number
  private revealedCells: number
  private flaggedCells: number
  private firstClick: boolean

  constructor(config: MinesweeperGameConfig) {
    super(config)
    this.width = config.width
    this.height = config.height
    this.totalMines = config.mines
    this.revealedCells = 0
    this.flaggedCells = 0
    this.firstClick = true
    this.board = this.initializeBoard()
    this.placeMines()
    this.calculateNeighborMines()
  }

  private initializeBoard(): Cell[][] {
    return Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      })))
  }

  private placeMines(): void {
    let minesPlaced = 0

    while (minesPlaced < this.totalMines) {
      const row = Math.floor(Math.random() * this.height)
      const col = Math.floor(Math.random() * this.width)

      const cell = this.board[row]?.[col]
      if (cell && !cell.isMine) {
        cell.isMine = true
        minesPlaced++
      }
    }
  }

  private calculateNeighborMines(): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = this.board[row]?.[col]
        if (cell && !cell.isMine) {
          cell.neighborMines = this.countNeighborMines(row, col)
        }
      }
    }
  }

  private countNeighborMines(row: number, col: number): number {
    let count = 0

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < this.height && c >= 0 && c < this.width) {
          const cell = this.board[r]?.[c]
          if (cell?.isMine) {
            count++
          }
        }
      }
    }

    return count
  }

  private getNeighbors(row: number, col: number): Array<{ row: number, col: number }> {
    const neighbors: Array<{ row: number, col: number }> = []

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < this.height && c >= 0 && c < this.width && !(r === row && c === col)) {
          neighbors.push({ row: r, col: c })
        }
      }
    }

    return neighbors
  }

  private repositionMine(clickedRow: number, clickedCol: number): void {
    // Remove mine from clicked cell
    const clickedCell = this.board[clickedRow]?.[clickedCol]
    if (clickedCell) {
      clickedCell.isMine = false
    }

    // Find a new location for the mine (not at clicked position or its neighbors)
    const excludedPositions = new Set<string>()
    excludedPositions.add(`${clickedRow},${clickedCol}`)

    // Also exclude neighbors of clicked cell
    const neighbors = this.getNeighbors(clickedRow, clickedCol)
    for (const neighbor of neighbors) {
      excludedPositions.add(`${neighbor.row},${neighbor.col}`)
    }

    // Find a suitable position for the mine
    let attempts = 0
    const maxAttempts = this.width * this.height

    while (attempts < maxAttempts) {
      const row = Math.floor(Math.random() * this.height)
      const col = Math.floor(Math.random() * this.width)
      const posKey = `${row},${col}`

      const cell = this.board[row]?.[col]
      if (cell && !cell.isMine && !excludedPositions.has(posKey)) {
        cell.isMine = true
        return
      }
      attempts++
    }
  }

  public revealCell(row: number, col: number, enableFirstClickProtection: boolean = false): boolean {
    return this.revealCellInternal(row, col, true, enableFirstClickProtection)
  }

  private revealCellInternal(
    row: number,
    col: number,
    incrementMove: boolean,
    enableFirstClickProtection: boolean = false
  ): boolean {
    if (this.gameState !== BaseGameState.PLAYING) {
      return false
    }

    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return false
    }

    const cell = this.board[row]?.[col]
    if (!cell)
      return false

    if (cell.isRevealed || cell.isFlagged) {
      return false
    }

    // First click protection - ensure first click is never a mine
    // Only applies when explicitly enabled (for UI-initiated moves)
    if (enableFirstClickProtection && this.firstClick && incrementMove && cell.isMine) {
      this.repositionMine(row, col)
      this.calculateNeighborMines()
    }

    if (this.firstClick && incrementMove) {
      this.firstClick = false
    }

    cell.isRevealed = true
    this.revealedCells++

    // Only increment move count for the initial user action, not recursive reveals
    if (incrementMove) {
      this.incrementMoveCount()
    }

    if (cell.isMine) {
      this.revealAllMines()
      this.gameLost()
      return true
    }

    // If the cell has no neighboring mines, reveal all neighbors
    if (cell.neighborMines === 0) {
      const neighbors = this.getNeighbors(row, col)
      for (const neighbor of neighbors) {
        this.revealCellInternal(neighbor.row, neighbor.col, false) // Don't increment move for auto-reveals
      }
    }

    // Check for win condition
    if (this.revealedCells === this.width * this.height - this.totalMines) {
      this.gameWon()
    }

    return true
  }

  public toggleFlag(row: number, col: number): boolean {
    if (this.gameState !== BaseGameState.PLAYING) {
      return false
    }

    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return false
    }

    const cell = this.board[row]?.[col]
    if (!cell)
      return false

    if (cell.isRevealed) {
      return false
    }

    cell.isFlagged = !cell.isFlagged
    this.flaggedCells += cell.isFlagged ? 1 : -1

    return true
  }

  private revealAllMines(): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = this.board[row]?.[col]
        if (cell?.isMine) {
          cell.isRevealed = true
        }
      }
    }
  }

  private flagAllRemainingMines(): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = this.board[row]?.[col]
        if (cell?.isMine && !cell.isFlagged) {
          cell.isFlagged = true
          this.flaggedCells++
        }
      }
    }
  }

  protected override gameWon(): void {
    // Auto-flag all remaining unflagged mines
    this.flagAllRemainingMines()

    // Call parent implementation to handle game state and notifications
    super.gameWon()
  }

  public getCell(row: number, col: number): Cell | null {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return null
    }
    return this.board[row]?.[col] || null
  }

  public getBoard(): Cell[][] {
    return this.board.map(row => row.map(cell => ({ ...cell })))
  }

  public override getGameState(): BaseGameState {
    return this.gameState
  }

  public getRemainingMines(): number {
    return this.totalMines - this.flaggedCells
  }

  public getRevealedCells(): number {
    return this.revealedCells
  }

  public getDimensions(): { width: number, height: number } {
    return { width: this.width, height: this.height }
  }

  public getTotalMines(): number {
    return this.totalMines
  }

  public override reset(config?: MinesweeperGameConfig): void {
    if (config) {
      this.width = config.width
      this.height = config.height
      this.totalMines = config.mines
      this.config = config
    }

    this.gameState = BaseGameState.IDLE
    this.revealedCells = 0
    this.flaggedCells = 0
    this.moveCount = 0
    this.score = 0
    this.startTime = null
    this.endTime = null
    this.firstClick = true
    this.board = this.initializeBoard()
    this.placeMines()
    this.calculateNeighborMines()
  }

  // Utility method to get a visual representation for debugging
  public override toString(): string {
    let result = ''
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = this.board[row]?.[col]
        if (!cell)
          continue

        if (cell.isFlagged) {
          result += 'F '
        }
        else if (!cell.isRevealed) {
          result += '? '
        }
        else if (cell.isMine) {
          result += '* '
        }
        else {
          result += `${cell.neighborMines} `
        }
      }
      result += '\n'
    }
    return result
  }

  // Abstract method implementations required by Game class
  public start(): void {
    if (this.gameState === BaseGameState.PLAYING) {
      return // Already started
    }

    this.gameState = BaseGameState.PLAYING
    this.startTime = new Date()
    this.notifyObservers({
      type: 'game-started',
      timestamp: new Date(),
      gameState: this.gameState
    })
  }

  public makeMove(move: { action: 'reveal' | 'flag', row: number, col: number }): boolean {
    if (move.action === 'reveal') {
      return this.revealCell(move.row, move.col)
    }
    else if (move.action === 'flag') {
      return this.toggleFlag(move.row, move.col)
    }
    return false
  }

  public isValidMove(move: { action: 'reveal' | 'flag', row: number, col: number }): boolean {
    if (this.gameState !== BaseGameState.PLAYING) {
      return false
    }

    if (move.row < 0 || move.row >= this.height || move.col < 0 || move.col >= this.width) {
      return false
    }

    const cell = this.board[move.row]?.[move.col]
    if (!cell)
      return false

    if (move.action === 'reveal') {
      return !cell.isRevealed && !cell.isFlagged
    }
    else if (move.action === 'flag') {
      return !cell.isRevealed
    }

    return false
  }

  public getGameData(): {
    board: Cell[][]
    gameState: BaseGameState
    remainingMines: number
    revealedCells: number
    dimensions: { width: number, height: number }
    totalMines: number
  } {
    return {
      board: this.getBoard(),
      gameState: this.gameState,
      remainingMines: this.getRemainingMines(),
      revealedCells: this.revealedCells,
      dimensions: this.getDimensions(),
      totalMines: this.totalMines
    }
  }

  public clone(): Minesweeper {
    const config: MinesweeperGameConfig = {
      width: this.width,
      height: this.height,
      mines: this.totalMines,
      difficulty: this.config.difficulty
    }

    const cloned = new Minesweeper(config)
    cloned.gameState = this.gameState
    cloned.revealedCells = this.revealedCells
    cloned.flaggedCells = this.flaggedCells
    cloned.moveCount = this.moveCount
    cloned.score = this.score
    cloned.firstClick = this.firstClick

    // Deep copy the board
    cloned.board = this.board.map(row =>
      row.map(cell => ({ ...cell }))
    )

    return cloned
  }
}

// Predefined difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: { width: 9, height: 9, mines: 10, difficulty: BaseGameDifficulty.EASY },
  INTERMEDIATE: { width: 16, height: 16, mines: 40, difficulty: BaseGameDifficulty.MEDIUM },
  EXPERT: { width: 30, height: 16, mines: 99, difficulty: BaseGameDifficulty.HARD }
} as const satisfies Record<string, MinesweeperGameConfig>

// Example usage:
// const game = new Minesweeper(DIFFICULTY_LEVELS.BEGINNER);
// game.start(); // Must call start() to begin playing
// game.makeMove({ action: 'reveal', row: 0, col: 0 });
// game.makeMove({ action: 'flag', row: 1, col: 1 });
// console.log(game.getGameState());
// console.log(game.getGameData());
