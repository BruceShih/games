import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'

export { and, eq, or, sql } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type User = typeof schema.users.$inferSelect
export type Credential = typeof schema.credentials.$inferSelect
export type Game = typeof schema.games.$inferSelect
export type GameState = typeof schema.gameStates.$inferSelect
export type Scoreboard = typeof schema.scoreboards.$inferSelect
