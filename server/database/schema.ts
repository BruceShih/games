import type { WebAuthnCredential } from '@simplewebauthn/server'
import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }).notNull()
})

export const credentials = sqliteTable('credentials', {
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  id: text('id').notNull().unique(),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull(),
  backedUp: integer('backed_up', { mode: 'boolean' }).notNull(),
  transports: text('transports', { mode: 'json' }).notNull().$type<WebAuthnCredential['transports']>()
}, table => [
  primaryKey({ columns: [table.userId, table.id] })
])

export const games = sqliteTable('games', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true)
})

export const gameStates = sqliteTable('game_states', {
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  playerId: integer('player_id').references(() => users.id).notNull(),
  id: integer('id').notNull().unique(),
  state: text('state').notNull(),
  valid: integer('valid', { mode: 'boolean' }).notNull().default(true)
}, table => [
  primaryKey({ columns: [table.gameId, table.playerId, table.id] })
])

export const scoreboards = sqliteTable('scoreboards', {
  gameId: integer('game_id').references(() => games.id).notNull(),
  playerId: integer('player_id').references(() => users.id).notNull(),
  id: integer('id').notNull().unique(),
  score: integer('score').notNull(),
  scoredAt: integer('scored_at', { mode: 'timestamp' }).notNull()
}, table => [
  primaryKey({ columns: [table.gameId, table.playerId, table.id] })
])

/**
 * Relations (useful for queries)
 */

export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(credentials),
  gameStates: many(gameStates),
  scoreboards: many(scoreboards)
}))

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id]
  })
}))

export const gamesRelations = relations(games, ({ many }) => ({
  gameStates: many(gameStates),
  scoreboards: many(scoreboards)
}))

export const gameStatesRelations = relations(gameStates, ({ many }) => ({
  games: many(games),
  player: many(users)
}))

export const scoreboardsRelations = relations(scoreboards, ({ many, one }) => ({
  games: many(games),
  player: one(users)
}))
