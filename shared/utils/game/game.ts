export enum BaseGameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  WON = 'won',
  LOST = 'lost',
  DRAW = 'draw'
}

export enum BaseGameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  CUSTOM = 'custom'
}

export interface BaseGameConfig {
  difficulty: BaseGameDifficulty
  [key: string]: unknown
}

export interface BaseGameStats {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  gamesDraw: number
  winRate: number
  bestTime?: number
  averageTime?: number
  currentStreak: number
  bestStreak: number
}

export interface BaseGameScore {
  score: number
  moves: number
  timeElapsed: number
  difficulty: BaseGameDifficulty
  timestamp: Date
}

export abstract class IBaseGame {
  protected gameState: BaseGameState
  protected config: BaseGameConfig
  protected startTime: Date | null
  protected endTime: Date | null
  protected moveCount: number
  protected score: number
  protected stats: BaseGameStats
  protected observers: Array<(event: GameEvent) => void>

  constructor(config: BaseGameConfig) {
    this.gameState = BaseGameState.IDLE
    this.config = config
    this.startTime = null
    this.endTime = null
    this.moveCount = 0
    this.score = 0
    this.observers = []
    this.stats = this.initializeStats()
  }

  // Abstract methods that must be implemented by concrete games
  abstract start(): void
  abstract reset(config?: BaseGameConfig): void
  abstract makeMove(move: unknown): boolean
  abstract isValidMove(move: unknown): boolean
  abstract getGameData(): unknown
  abstract clone(): IBaseGame

  // Common game lifecycle methods
  public pause(): void {
    if (this.gameState === BaseGameState.PLAYING) {
      this.gameState = BaseGameState.PAUSED
      this.notifyObservers({
        type: 'game-paused',
        timestamp: new Date(),
        gameState: this.gameState
      })
    }
  }

  public resume(): void {
    if (this.gameState === BaseGameState.PAUSED) {
      this.gameState = BaseGameState.PLAYING
      this.notifyObservers({
        type: 'game-resumed',
        timestamp: new Date(),
        gameState: this.gameState
      })
    }
  }

  public quit(): void {
    if (this.gameState === BaseGameState.PLAYING || this.gameState === BaseGameState.PAUSED) {
      this.gameState = BaseGameState.IDLE
      this.endTime = new Date()
      this.notifyObservers({
        type: 'game-quit',
        timestamp: new Date(),
        gameState: this.gameState
      })
    }
  }

  // Game state methods
  public getGameState(): BaseGameState {
    return this.gameState
  }

  public isGameActive(): boolean {
    return this.gameState === BaseGameState.PLAYING || this.gameState === BaseGameState.PAUSED
  }

  public isGameFinished(): boolean {
    return this.gameState === BaseGameState.WON
      || this.gameState === BaseGameState.LOST
      || this.gameState === BaseGameState.DRAW
  }

  // Time tracking methods
  public getElapsedTime(): number {
    if (!this.startTime)
      return 0

    const endTime = this.endTime || new Date()
    return endTime.getTime() - this.startTime.getTime()
  }

  public getElapsedTimeFormatted(): string {
    const elapsed = this.getElapsedTime()
    const seconds = Math.floor(elapsed / 1000) % 60
    const minutes = Math.floor(elapsed / (1000 * 60)) % 60
    const hours = Math.floor(elapsed / (1000 * 60 * 60))

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Score and move tracking
  public getScore(): number {
    return this.score
  }

  public getMoveCount(): number {
    return this.moveCount
  }

  protected incrementMoveCount(): void {
    this.moveCount++
    this.notifyObservers({
      type: 'move-made',
      timestamp: new Date(),
      moveCount: this.moveCount
    })
  }

  protected updateScore(points: number): void {
    this.score += points
    this.notifyObservers({
      type: 'score-updated',
      timestamp: new Date(),
      score: this.score,
      points
    })
  }

  // Game completion methods
  protected gameWon(): void {
    this.gameState = BaseGameState.WON
    this.endTime = new Date()
    this.updateStats('won')

    const gameScore: BaseGameScore = {
      score: this.score,
      moves: this.moveCount,
      timeElapsed: this.getElapsedTime(),
      difficulty: this.config.difficulty,
      timestamp: this.endTime
    }

    this.notifyObservers({
      type: 'game-won',
      timestamp: new Date(),
      gameState: this.gameState,
      gameScore
    })
  }

  protected gameLost(): void {
    this.gameState = BaseGameState.LOST
    this.endTime = new Date()
    this.updateStats('lost')

    this.notifyObservers({
      type: 'game-lost',
      timestamp: new Date(),
      gameState: this.gameState
    })
  }

  protected gameDraw(): void {
    this.gameState = BaseGameState.DRAW
    this.endTime = new Date()
    this.updateStats('draw')

    this.notifyObservers({
      type: 'game-draw',
      timestamp: new Date(),
      gameState: this.gameState
    })
  }

  // Statistics methods
  public getStats(): BaseGameStats {
    return { ...this.stats }
  }

  private initializeStats(): BaseGameStats {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDraw: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0
    }
  }

  private updateStats(result: 'won' | 'lost' | 'draw'): void {
    this.stats.gamesPlayed++

    switch (result) {
      case 'won': {
        this.stats.gamesWon++
        this.stats.currentStreak++
        this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak)

        const currentTime = this.getElapsedTime()
        if (!this.stats.bestTime || currentTime < this.stats.bestTime) {
          this.stats.bestTime = currentTime
        }

        this.stats.averageTime = this.stats.averageTime
          ? (this.stats.averageTime + currentTime) / 2
          : currentTime
        break
      }

      case 'lost':
        this.stats.gamesLost++
        this.stats.currentStreak = 0
        break

      case 'draw':
        this.stats.gamesDraw++
        break
    }

    this.stats.winRate = this.stats.gamesPlayed > 0
      ? (this.stats.gamesWon / this.stats.gamesPlayed) * 100
      : 0
  }

  public resetStats(): void {
    this.stats = this.initializeStats()
  }

  // Configuration methods
  public getConfig(): BaseGameConfig {
    return { ...this.config }
  }

  public updateConfig(newConfig: Partial<BaseGameConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.notifyObservers({
      type: 'config-updated',
      timestamp: new Date(),
      config: this.config
    })
  }

  // Observer pattern for game events
  public addObserver(observer: (event: GameEvent) => void): void {
    this.observers.push(observer)
  }

  public removeObserver(observer: (event: GameEvent) => void): void {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  protected notifyObservers(event: GameEvent): void {
    this.observers.forEach(observer => observer(event))
  }

  // Utility methods
  public serialize(): string {
    return JSON.stringify({
      gameState: this.gameState,
      config: this.config,
      startTime: this.startTime,
      endTime: this.endTime,
      moveCount: this.moveCount,
      score: this.score,
      stats: this.stats
    })
  }

  public static deserialize(data: string): unknown {
    return JSON.parse(data)
  }

  // Undo/Redo functionality (optional, can be overridden)
  protected gameHistory: unknown[] = []
  protected historyIndex: number = -1

  public canUndo(): boolean {
    return this.historyIndex > 0
  }

  public canRedo(): boolean {
    return this.historyIndex < this.gameHistory.length - 1
  }

  public undo(): boolean {
    if (this.canUndo()) {
      this.historyIndex--
      this.restoreGameState(this.gameHistory[this.historyIndex])
      return true
    }
    return false
  }

  public redo(): boolean {
    if (this.canRedo()) {
      this.historyIndex++
      this.restoreGameState(this.gameHistory[this.historyIndex])
      return true
    }
    return false
  }

  protected saveGameState(state: unknown): void {
    // Remove any states after current index when saving new state
    this.gameHistory = this.gameHistory.slice(0, this.historyIndex + 1)
    this.gameHistory.push(state)
    this.historyIndex++

    // Limit history size to prevent memory issues
    const maxHistorySize = 100
    if (this.gameHistory.length > maxHistorySize) {
      this.gameHistory.shift()
      this.historyIndex--
    }
  }

  protected restoreGameState(_state: unknown): void {
    // This should be implemented by subclasses based on their specific state structure
    throw new Error('restoreGameState must be implemented by subclasses')
  }
}

// Game event types
export interface GameEvent {
  type: 'game-started' | 'game-paused' | 'game-resumed' | 'game-quit'
    | 'game-won' | 'game-lost' | 'game-draw' | 'move-made'
    | 'score-updated' | 'config-updated'
  timestamp: Date
  gameState?: BaseGameState
  moveCount?: number
  score?: number
  points?: number
  config?: BaseGameConfig
  gameScore?: BaseGameScore
}

// Utility functions for common game operations
// export class GameUtils {
//   static generateId(): string {
//     return Math.random().toString(36).substring(2, 15)
//       + Math.random().toString(36).substring(2, 15)
//   }

//   static shuffleArray<T>(array: T[]): T[] {
//     const shuffled = [...array]
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1))
//       ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
//     }
//     return shuffled
//   }

//   static getRandomInt(min: number, max: number): number {
//     return Math.floor(Math.random() * (max - min + 1)) + min
//   }

//   static formatTime(milliseconds: number): string {
//     const seconds = Math.floor(milliseconds / 1000) % 60
//     const minutes = Math.floor(milliseconds / (1000 * 60)) % 60
//     const hours = Math.floor(milliseconds / (1000 * 60 * 60))

//     if (hours > 0) {
//       return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
//     }
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
//   }
// }
