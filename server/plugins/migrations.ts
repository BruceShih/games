import { migrate } from 'drizzle-orm/d1/migrator'
import { useDrizzle } from '../utils/drizzle'

export default defineNitroPlugin(async () => {
  if (!import.meta.dev)
    return

  onHubReady(async () => {
    await migrate(useDrizzle(), { migrationsFolder: 'server/database/migrations' })
      .then(() => {
        console.info('Database migrations done')
      })
      .catch((err) => {
        console.error('Database migrations failed', err)
      })
  })
})
