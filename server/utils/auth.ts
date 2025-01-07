import { betterAuth } from "better-auth";
import { admin, anonymous } from "better-auth/plugins";
import { D1Dialect } from "kysely-d1";

export const auth = betterAuth({
  database: {
    dialect: new D1Dialect({
      // @ts-expect-error after "@nuxthub/core": "^0.8.7", 'dump()' is deprecated by cloudflare
      // and removed from the type definition, but in "@cloudflare/workers-types" it is still there
      database: hubDatabase()
    }),
    type: 'sqlite'
  },
  emailAndPassword: {
    enabled: true
  },
  plugins: [anonymous(), admin()]
})
