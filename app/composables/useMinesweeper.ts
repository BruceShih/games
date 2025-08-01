import type { Cell, MinesweeperGameConfig } from '#shared/utils/game/minesweeper'
import { BaseGameState } from '#shared/utils/game/game'
import { DIFFICULTY_LEVELS, Minesweeper } from '#shared/utils/game/minesweeper'
import { computed, readonly, ref } from 'vue'

export interface MinesweeperMove {
  action: 'reveal' | 'flag'
  row: number
  col: number
}

// Re-export for convenience
export { type Cell, DIFFICULTY_LEVELS, type MinesweeperGameConfig }

export function useMinesweeper(initialConfig: MinesweeperGameConfig = DIFFICULTY_LEVELS.BEGINNER) {
  // Create the Minesweeper game instance
  const game = new Minesweeper(initialConfig)

  // Reactive state that syncs with the game instance
  const gameState = ref<BaseGameState>(game.getGameState())
  const board = ref<Cell[][]>(game.getBoard())
  const revealedCells = ref(game.getRevealedCells())
  const flaggedCells = ref(game.getRemainingMines())
  const moveCount = ref(game.getMoveCount())
  const score = ref(game.getScore())

  // Helper function to sync reactive state with game instance
  function syncState(): void {
    gameState.value = game.getGameState()
    board.value = game.getBoard()
    revealedCells.value = game.getRevealedCells()
    flaggedCells.value = game.getRemainingMines()
    moveCount.value = game.getMoveCount()
    score.value = game.getScore()
  }

  // Computed properties
  const width = computed(() => game.getDimensions().width)
  const height = computed(() => game.getDimensions().height)
  const totalMines = computed(() => game.getTotalMines())
  const remainingMines = computed(() => game.getRemainingMines())
  const isPlaying = computed(() => gameState.value === BaseGameState.PLAYING)
  const isGameOver = computed(() =>
    gameState.value === BaseGameState.WON || gameState.value === BaseGameState.LOST
  )
  const gameTime = computed(() => {
    return Math.floor(game.getElapsedTime() / 1000)
  })

  // Public methods that wrap the game instance methods
  function start(): void {
    game.start()
    syncState()
  }

  function reset(newConfig?: MinesweeperGameConfig): void {
    game.reset(newConfig)
    syncState()
  }

  function revealCell(row: number, col: number, enableFirstClickProtection: boolean = false): boolean {
    const result = game.revealCell(row, col, enableFirstClickProtection)
    syncState()
    return result
  }

  function toggleFlag(row: number, col: number): boolean {
    const result = game.toggleFlag(row, col)
    syncState()
    return result
  }

  function makeMove(move: MinesweeperMove): boolean {
    const result = game.makeMove(move)
    syncState()
    return result
  }

  function isValidMove(move: MinesweeperMove): boolean {
    return game.isValidMove(move)
  }

  function getCell(row: number, col: number): Cell | null {
    if (row < 0 || row >= height.value || col < 0 || col >= width.value) {
      return null
    }
    const boardValue = board.value
    return boardValue[row]?.[col] || null
  }

  function pause(): void {
    game.pause()
    syncState()
  }

  function resume(): void {
    game.resume()
    syncState()
  }

  function quit(): void {
    game.quit()
    syncState()
  }

  // Initialize the reactive state
  syncState()

  return {
    // Reactive state
    gameState: readonly(gameState),
    board: readonly(board),
    revealedCells: readonly(revealedCells),
    flaggedCells: readonly(flaggedCells),
    moveCount: readonly(moveCount),
    score: readonly(score),

    // Computed properties
    width,
    height,
    totalMines,
    remainingMines,
    isPlaying,
    isGameOver,
    gameTime,

    // Methods
    start,
    reset,
    revealCell,
    toggleFlag,
    makeMove,
    isValidMove,
    getCell,
    pause,
    resume,
    quit
  }
}

export type MinesweeperComposable = ReturnType<typeof useMinesweeper>
