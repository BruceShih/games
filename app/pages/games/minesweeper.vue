<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DIFFICULTY_LEVELS, useMinesweeper } from '~/composables/useMinesweeper'

// Initialize the minesweeper game with beginner difficulty
const {
  gameState,
  width,
  height,
  remainingMines,
  isGameOver,
  gameTime,
  moveCount,
  start,
  reset,
  revealCell,
  toggleFlag,
  getCell
} = useMinesweeper(DIFFICULTY_LEVELS.BEGINNER)

// Current difficulty level
const currentDifficulty = ref('BEGINNER')

// Handle cell click (left click to reveal)
function handleCellClick(row: number, col: number) {
  if (gameState.value === 'idle') {
    start()
  }
  revealCell(row, col, true) // Enable first-click protection for UI clicks
}

// Handle cell right click (right click to flag)
function handleCellRightClick(event: MouseEvent, row: number, col: number) {
  event.preventDefault()
  if (gameState.value === 'idle') {
    start()
  }
  toggleFlag(row, col)
}

// Change difficulty
function changeDifficulty(difficulty: unknown) {
  if (!difficulty || typeof difficulty !== 'string')
    return
  currentDifficulty.value = difficulty
  reset(DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS])
}

// Get cell display content
function getCellContent(row: number, col: number) {
  const cell = getCell(row, col)
  if (!cell)
    return ''

  if (cell.isFlagged)
    return '🚩'
  if (!cell.isRevealed)
    return ''
  if (cell.isMine)
    return '💣'
  if (cell.neighborMines === 0)
    return ''
  return cell.neighborMines.toString()
}

// Get cell CSS classes with Tailwind
function getCellClasses(row: number, col: number) {
  const cell = getCell(row, col)
  if (!cell)
    return ''

  const baseClasses = [
    'w-8 h-8 text-sm font-bold flex items-center justify-center transition-all duration-100 border-2'
  ]

  if (cell.isRevealed) {
    baseClasses.push('bg-background border-border')
    if (cell.isMine) {
      baseClasses.push('bg-destructive text-destructive-foreground')
    }
    else if (cell.neighborMines > 0) {
      baseClasses.push(getNumberColor(cell.neighborMines))
    }
  }
  else {
    baseClasses.push('bg-muted hover:bg-muted/80 active:bg-muted/60 border-muted-foreground/20')
    if (cell.isFlagged) {
      baseClasses.push('bg-yellow-100 dark:bg-yellow-900/30')
    }
  }

  if (!isGameOver.value && !cell.isRevealed) {
    baseClasses.push('cursor-pointer')
  }
  else {
    baseClasses.push('cursor-default')
  }

  return baseClasses.join(' ')
}

// Get number color classes
function getNumberColor(number: number): string {
  const colors = {
    1: 'text-blue-600 dark:text-blue-400',
    2: 'text-green-600 dark:text-green-400',
    3: 'text-orange-600 dark:text-orange-400',
    4: 'text-purple-600 dark:text-purple-400',
    5: 'text-red-600 dark:text-red-400',
    6: 'text-teal-600 dark:text-teal-400',
    7: 'text-indigo-600 dark:text-indigo-400',
    8: 'text-gray-600 dark:text-gray-400'
  }
  return colors[number as keyof typeof colors] || 'text-foreground'
}

// Get status card classes
function getStatusCardClass() {
  const baseClasses = ['transition-colors duration-200']

  switch (gameState.value) {
    case 'idle':
      baseClasses.push('bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800')
      break
    case 'playing':
      baseClasses.push('bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800')
      break
    case 'won':
      baseClasses.push('bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800')
      break
    case 'lost':
      baseClasses.push('bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800')
      break
    default:
      baseClasses.push('bg-muted')
  }

  return baseClasses.join(' ')
}

// Format time display
const formattedTime = computed(() => {
  const time = gameTime.value
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Game status message
const statusMessage = computed(() => {
  switch (gameState.value) {
    case 'idle':
      return 'Click a cell to start!'
    case 'playing':
      return 'Good luck!'
    case 'won':
      return '🎉 You won!'
    case 'lost':
      return '💥 Game over!'
    case 'paused':
      return 'Game paused'
    default:
      return ''
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-foreground">
        💣 Minesweeper
      </h1>

      <!-- Difficulty selector -->
      <div class="flex items-center justify-center gap-3">
        <label class="text-sm font-medium">Difficulty:</label>
        <Select
          :model-value="currentDifficulty"
          @update:model-value="changeDifficulty"
        >
          <SelectTrigger class="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BEGINNER">
              Beginner (9×9, 10 mines)
            </SelectItem>
            <SelectItem value="INTERMEDIATE">
              Intermediate (16×16, 40 mines)
            </SelectItem>
            <SelectItem value="EXPERT">
              Expert (30×16, 99 mines)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Game stats -->
    <Card>
      <CardContent class="p-4">
        <div class="flex justify-center gap-8">
          <div class="text-center">
            <div class="text-sm text-muted-foreground mb-1">
              💣 Mines
            </div>
            <div class="text-2xl font-bold">
              {{ remainingMines }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-sm text-muted-foreground mb-1">
              ⏱️ Time
            </div>
            <div class="text-2xl font-bold">
              {{ formattedTime }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-sm text-muted-foreground mb-1">
              🎯 Moves
            </div>
            <div class="text-2xl font-bold">
              {{ moveCount }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Game status -->
    <Card :class="getStatusCardClass()">
      <CardContent class="p-4 text-center">
        <div class="text-lg font-semibold">
          {{ statusMessage }}
        </div>
      </CardContent>
    </Card>

    <!-- Game controls -->
    <div class="flex justify-center gap-3">
      <Button
        @click="gameState === 'idle' ? start() : reset()"
      >
        {{ gameState === 'idle' ? 'Start Game' : 'New Game' }}
      </Button>
      <Button
        variant="outline"
        @click="reset()"
      >
        Reset
      </Button>
    </div>

    <!-- Game board -->
    <div class="flex justify-center">
      <div
        class="inline-grid gap-0.5 p-3 bg-muted rounded-lg"
        :style="{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
        }"
      >
        <button
          v-for="(_, index) in width * height"
          :key="index"
          :class="getCellClasses(Math.floor(index / width), index % width)"
          :disabled="isGameOver"
          @click="handleCellClick(Math.floor(index / width), index % width)"
          @contextmenu="handleCellRightClick($event, Math.floor(index / width), index % width)"
        >
          {{ getCellContent(Math.floor(index / width), index % width) }}
        </button>
      </div>
    </div>

    <!-- Instructions -->
    <Card>
      <CardHeader>
        <CardTitle>How to play:</CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2 text-sm">
          <li><strong>Left click</strong> to reveal a cell</li>
          <li><strong>Right click</strong> to flag/unflag a cell</li>
          <li>Numbers show how many mines are in adjacent cells</li>
          <li>Flag all mines to win!</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
