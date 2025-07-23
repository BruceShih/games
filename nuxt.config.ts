// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // https://nuxt.com/modules
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxt/fonts',
    'shadcn-nuxt',
    'nuxt-auth-utils',
    '@nuxt/test-utils/module'
  ],
  // https://devtools.nuxt.com
  devtools: { enabled: true },
  css: ['./app/assets/css/tailwind.css'],
  compatibilityDate: '2025-01-28',
  // https://nitro.build/config
  nitro: {
    experimental: {
      websocket: true
    }
  },
  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    database: true,
    kv: true,
    workers: true
  },
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  typescript: {
    // Customize app/server TypeScript config
    tsConfig: {
      compilerOptions: {
        strict: true
      }
    },
    // Customize build-time TypeScript config
    nodeTsConfig: {
      compilerOptions: {
        strict: true
      }
    }
  },
  // https://eslint.nuxt.com
  eslint: {
    config: {
      standalone: false
    }
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './app/components/ui'
  },
  auth: {
    webAuthn: true
  },
  runtimeConfig: {
    public: {
      enableSignup: process.env.ENABLE_SIGNUP === 'true'
    }
  }
})
