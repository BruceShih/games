import type { MinesweeperGameConfig } from '../minesweeper'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BaseGameDifficulty, BaseGameState } from '../game'
import { DIFFICULTY_LEVELS, Minesweeper } from '../minesweeper'

describe('minesweeper', () => {
  let game: Minesweeper
  let config: MinesweeperGameConfig

  beforeEach(() => {
    config = {
      width: 5,
      height: 5,
      mines: 3,
      difficulty: BaseGameDifficulty.EASY
    }
    game = new Minesweeper(config)
  })

  describe('constructor and Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(game.getDimensions()).toEqual({ width: 5, height: 5 })
      expect(game.getTotalMines()).toBe(3)
      expect(game.getGameState()).toBe(BaseGameState.IDLE)
      expect(game.getRevealedCells()).toBe(0)
      expect(game.getRemainingMines()).toBe(3)
    })

    it('should create a board with correct dimensions', () => {
      const board = game.getBoard()
      expect(board).toHaveLength(5)
      expect(board[0]).toHaveLength(5)

      // Check that all cells are initialized properly
      board.forEach((row) => {
        row.forEach((cell) => {
          expect(cell).toHaveProperty('isMine')
          expect(cell).toHaveProperty('isRevealed', false)
          expect(cell).toHaveProperty('isFlagged', false)
          expect(cell).toHaveProperty('neighborMines')
        })
      })
    })

    it('should place the correct number of mines', () => {
      const board = game.getBoard()
      let mineCount = 0

      board.forEach((row) => {
        row.forEach((cell) => {
          if (cell.isMine)
            mineCount++
        })
      })

      expect(mineCount).toBe(3)
    })

    it('should calculate neighbor mine counts correctly', () => {
      const board = game.getBoard()

      board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (!cell.isMine) {
            // Manually count neighbors to verify
            let expectedCount = 0
            for (let r = rowIndex - 1; r <= rowIndex + 1; r++) {
              for (let c = colIndex - 1; c <= colIndex + 1; c++) {
                if (r >= 0 && r < 5 && c >= 0 && c < 5 && board[r]?.[c]?.isMine) {
                  expectedCount++
                }
              }
            }
            expect(cell.neighborMines).toBe(expectedCount)
          }
        })
      })
    })
  })

  describe('predefined difficulty levels', () => {
    it('should have correct BEGINNER configuration', () => {
      const beginner = DIFFICULTY_LEVELS.BEGINNER
      expect(beginner.width).toBe(9)
      expect(beginner.height).toBe(9)
      expect(beginner.mines).toBe(10)
      expect(beginner.difficulty).toBe(BaseGameDifficulty.EASY)
    })

    it('should have correct INTERMEDIATE configuration', () => {
      const intermediate = DIFFICULTY_LEVELS.INTERMEDIATE
      expect(intermediate.width).toBe(16)
      expect(intermediate.height).toBe(16)
      expect(intermediate.mines).toBe(40)
      expect(intermediate.difficulty).toBe(BaseGameDifficulty.MEDIUM)
    })

    it('should have correct EXPERT configuration', () => {
      const expert = DIFFICULTY_LEVELS.EXPERT
      expect(expert.width).toBe(30)
      expect(expert.height).toBe(16)
      expect(expert.mines).toBe(99)
      expect(expert.difficulty).toBe(BaseGameDifficulty.HARD)
    })
  })

  describe('game state management', () => {
    it('should start in IDLE state', () => {
      expect(game.getGameState()).toBe(BaseGameState.IDLE)
    })

    it('should transition to PLAYING when started', () => {
      game.start()
      expect(game.getGameState()).toBe(BaseGameState.PLAYING)
    })

    it('should not allow moves when not playing', () => {
      expect(game.revealCell(0, 0)).toBe(false)
      expect(game.toggleFlag(0, 0)).toBe(false)
    })

    it('should allow moves when playing', () => {
      game.start()
      const result = game.revealCell(0, 0)
      expect(result).toBe(true)
    })
  })

  describe('cell operations', () => {
    beforeEach(() => {
      game.start()
    })

    it('should reveal a cell successfully', () => {
      const initialRevealed = game.getRevealedCells()
      game.revealCell(0, 0)

      const cell = game.getCell(0, 0)
      expect(cell?.isRevealed).toBe(true)
      expect(game.getRevealedCells()).toBeGreaterThan(initialRevealed)
    })

    it('should not reveal an already revealed cell', () => {
      game.revealCell(0, 0)
      const revealedCount = game.getRevealedCells()

      const result = game.revealCell(0, 0)
      expect(result).toBe(false)
      expect(game.getRevealedCells()).toBe(revealedCount)
    })

    it('should not reveal a flagged cell', () => {
      game.toggleFlag(0, 0)
      const result = game.revealCell(0, 0)

      expect(result).toBe(false)
      const cell = game.getCell(0, 0)
      expect(cell?.isRevealed).toBe(false)
    })

    it('should toggle flag on a cell', () => {
      const result = game.toggleFlag(0, 0)
      expect(result).toBe(true)

      const cell = game.getCell(0, 0)
      expect(cell?.isFlagged).toBe(true)
      expect(game.getRemainingMines()).toBe(2)
    })

    it('should untoggle flag on a flagged cell', () => {
      game.toggleFlag(0, 0)
      game.toggleFlag(0, 0)

      const cell = game.getCell(0, 0)
      expect(cell?.isFlagged).toBe(false)
      expect(game.getRemainingMines()).toBe(3)
    })

    it('should not flag a revealed cell', () => {
      game.revealCell(0, 0)
      const result = game.toggleFlag(0, 0)

      expect(result).toBe(false)
      const cell = game.getCell(0, 0)
      expect(cell?.isFlagged).toBe(false)
    })

    it('should handle out-of-bounds coordinates', () => {
      expect(game.revealCell(-1, 0)).toBe(false)
      expect(game.revealCell(0, -1)).toBe(false)
      expect(game.revealCell(5, 0)).toBe(false)
      expect(game.revealCell(0, 5)).toBe(false)

      expect(game.toggleFlag(-1, 0)).toBe(false)
      expect(game.toggleFlag(0, -1)).toBe(false)
      expect(game.toggleFlag(5, 0)).toBe(false)
      expect(game.toggleFlag(0, 5)).toBe(false)

      expect(game.getCell(-1, 0)).toBe(null)
      expect(game.getCell(0, -1)).toBe(null)
      expect(game.getCell(5, 0)).toBe(null)
      expect(game.getCell(0, 5)).toBe(null)
    })
  })

  describe('auto-reveal functionality', () => {
    it('should auto-reveal neighboring cells when revealing a cell with no neighboring mines', () => {
      // Create a specific game with a known mine pattern
      const testConfig = {
        width: 3,
        height: 3,
        mines: 1,
        difficulty: BaseGameDifficulty.EASY
      }
      const testGame = new Minesweeper(testConfig)

      // Mock the mine placement to have a predictable board
      vi.spyOn(Math, 'random').mockReturnValue(0.99) // This should place mine at bottom-right
      testGame.reset(testConfig)
      testGame.start()

      // Reveal a corner cell that should have no neighboring mines
      testGame.revealCell(0, 0)

      // Should have revealed multiple cells
      expect(testGame.getRevealedCells()).toBeGreaterThan(1)

      vi.restoreAllMocks()
    })
  })

  describe('game win/loss conditions', () => {
    it('should transition to LOST when revealing a mine', () => {
      game.start()

      // Find a mine and reveal it
      const board = game.getBoard()
      let mineRow = -1
      let mineCol = -1

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (board[row]?.[col]?.isMine) {
            mineRow = row
            mineCol = col
            break
          }
        }
        if (mineRow !== -1)
          break
      }

      if (mineRow !== -1 && mineCol !== -1) {
        game.revealCell(mineRow, mineCol)
        expect(game.getGameState()).toBe(BaseGameState.LOST)
      }
    })

    it('should transition to WON when all non-mine cells are revealed', () => {
      // Create a small game for easier testing
      const smallConfig = {
        width: 2,
        height: 2,
        mines: 1,
        difficulty: BaseGameDifficulty.EASY
      }
      const smallGame = new Minesweeper(smallConfig)
      smallGame.start()

      const board = smallGame.getBoard()

      // Reveal all non-mine cells
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          if (!board[row]?.[col]?.isMine) {
            smallGame.revealCell(row, col)
          }
        }
      }

      expect(smallGame.getGameState()).toBe(BaseGameState.WON)
    })
  })

  describe('move validation', () => {
    beforeEach(() => {
      game.start()
    })

    it('should validate reveal moves correctly', () => {
      expect(game.isValidMove({ action: 'reveal', row: 0, col: 0 })).toBe(true)
      expect(game.isValidMove({ action: 'reveal', row: -1, col: 0 })).toBe(false)
      expect(game.isValidMove({ action: 'reveal', row: 5, col: 0 })).toBe(false)

      // Flag a cell and try to reveal it
      game.toggleFlag(0, 0)
      expect(game.isValidMove({ action: 'reveal', row: 0, col: 0 })).toBe(false)

      // Reveal a cell and try to reveal it again
      game.toggleFlag(1, 1) // unflag first if needed
      game.revealCell(1, 1)
      expect(game.isValidMove({ action: 'reveal', row: 1, col: 1 })).toBe(false)
    })

    it('should validate flag moves correctly', () => {
      expect(game.isValidMove({ action: 'flag', row: 0, col: 0 })).toBe(true)
      expect(game.isValidMove({ action: 'flag', row: -1, col: 0 })).toBe(false)
      expect(game.isValidMove({ action: 'flag', row: 5, col: 0 })).toBe(false)

      // Reveal a cell and try to flag it
      game.revealCell(0, 0)
      expect(game.isValidMove({ action: 'flag', row: 0, col: 0 })).toBe(false)
    })

    it('should not validate moves when game is not playing', () => {
      game.quit()
      expect(game.isValidMove({ action: 'reveal', row: 0, col: 0 })).toBe(false)
      expect(game.isValidMove({ action: 'flag', row: 0, col: 0 })).toBe(false)
    })
  })

  describe('makeMove method', () => {
    beforeEach(() => {
      game.start()
    })

    it('should handle reveal moves', () => {
      const result = game.makeMove({ action: 'reveal', row: 0, col: 0 })
      expect(result).toBe(true)

      const cell = game.getCell(0, 0)
      expect(cell?.isRevealed).toBe(true)
    })

    it('should handle flag moves', () => {
      const result = game.makeMove({ action: 'flag', row: 0, col: 0 })
      expect(result).toBe(true)

      const cell = game.getCell(0, 0)
      expect(cell?.isFlagged).toBe(true)
    })

    it('should return false for invalid actions', () => {
      const result = game.makeMove({ action: 'invalid' as 'reveal' | 'flag', row: 0, col: 0 })
      expect(result).toBe(false)
    })
  })

  describe('reset functionality', () => {
    it('should reset game to initial state', () => {
      game.start()
      game.revealCell(0, 0)
      game.toggleFlag(1, 1)

      game.reset()

      expect(game.getGameState()).toBe(BaseGameState.IDLE)
      expect(game.getRevealedCells()).toBe(0)
      expect(game.getRemainingMines()).toBe(3)

      const board = game.getBoard()
      board.forEach((row) => {
        row.forEach((cell) => {
          expect(cell.isRevealed).toBe(false)
          expect(cell.isFlagged).toBe(false)
        })
      })
    })

    it('should reset with new configuration', () => {
      const newConfig = {
        width: 10,
        height: 10,
        mines: 15,
        difficulty: BaseGameDifficulty.MEDIUM
      }

      game.reset(newConfig)

      expect(game.getDimensions()).toEqual({ width: 10, height: 10 })
      expect(game.getTotalMines()).toBe(15)
    })
  })

  describe('game data and statistics', () => {
    beforeEach(() => {
      game.start()
    })

    it('should provide complete game data', () => {
      const gameData = game.getGameData()

      expect(gameData).toHaveProperty('board')
      expect(gameData).toHaveProperty('gameState')
      expect(gameData).toHaveProperty('remainingMines')
      expect(gameData).toHaveProperty('revealedCells')
      expect(gameData).toHaveProperty('dimensions')
      expect(gameData).toHaveProperty('totalMines')

      expect(gameData.board).toHaveLength(5)
      expect(gameData.gameState).toBe(BaseGameState.PLAYING)
      expect(gameData.remainingMines).toBe(3)
      expect(gameData.dimensions).toEqual({ width: 5, height: 5 })
      expect(gameData.totalMines).toBe(3)
    })

    it('should track move count', () => {
      expect(game.getMoveCount()).toBe(0)

      game.revealCell(0, 0)
      expect(game.getMoveCount()).toBe(1)

      game.toggleFlag(1, 1)
      expect(game.getMoveCount()).toBe(1) // Flags don't increment move count
    })
  })

  describe('clone functionality', () => {
    it('should create an exact copy of the game', () => {
      game.start()
      game.revealCell(0, 0)
      game.toggleFlag(1, 1)

      const cloned = game.clone()

      expect(cloned.getGameState()).toBe(game.getGameState())
      expect(cloned.getRevealedCells()).toBe(game.getRevealedCells())
      expect(cloned.getRemainingMines()).toBe(game.getRemainingMines())
      expect(cloned.getMoveCount()).toBe(game.getMoveCount())
      expect(cloned.getDimensions()).toEqual(game.getDimensions())
      expect(cloned.getTotalMines()).toBe(game.getTotalMines())

      // Verify board state is identical
      const originalBoard = game.getBoard()
      const clonedBoard = cloned.getBoard()

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const originalCell = originalBoard[row]?.[col]
          const clonedCell = clonedBoard[row]?.[col]

          expect(clonedCell?.isMine).toBe(originalCell?.isMine)
          expect(clonedCell?.isRevealed).toBe(originalCell?.isRevealed)
          expect(clonedCell?.isFlagged).toBe(originalCell?.isFlagged)
          expect(clonedCell?.neighborMines).toBe(originalCell?.neighborMines)
        }
      }
    })

    it('should create independent copies', () => {
      game.start()
      const cloned = game.clone()

      // Modify original game
      game.revealCell(0, 0)

      // Cloned game should not be affected
      const clonedCell = cloned.getCell(0, 0)
      expect(clonedCell?.isRevealed).toBe(false)
    })
  })

  describe('toString method', () => {
    it('should return a string representation of the board', () => {
      game.start()
      const boardString = game.toString()

      expect(typeof boardString).toBe('string')
      expect(boardString.split('\n')).toHaveLength(6) // 5 rows + empty line at end

      // Should contain unrevealed cells (?)
      expect(boardString).toContain('?')
    })

    it('should show flagged cells', () => {
      game.start()
      game.toggleFlag(0, 0)

      const boardString = game.toString()
      expect(boardString).toContain('F')
    })

    it('should show revealed cells with mine counts', () => {
      game.start()

      // Find a non-mine cell and reveal it
      const board = game.getBoard()
      let nonMineRow = -1
      let nonMineCol = -1

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!board[row]?.[col]?.isMine) {
            nonMineRow = row
            nonMineCol = col
            break
          }
        }
        if (nonMineRow !== -1)
          break
      }

      if (nonMineRow !== -1 && nonMineCol !== -1) {
        game.revealCell(nonMineRow, nonMineCol)
        const boardString = game.toString()

        // Should contain the neighbor mine count
        const neighborCount = board[nonMineRow]?.[nonMineCol]?.neighborMines
        expect(boardString).toContain(neighborCount?.toString())
      }
    })
  })
})
