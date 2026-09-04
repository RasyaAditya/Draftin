import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-04',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      titleTemplate: '%s · Draftin',
      htmlAttrs: { lang: 'id' },
    },
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
      midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION,
    },
  },

  typescript: {
    strict: true,
  },
})
