import colors from 'vuetify/es5/util/colors'

// Uncomment if you want to use per-page permission settings.
// import { pagePermissions } from './plugins/pagePermissions.js'

// Loads an env file for the specified environment.
const environment = process.env.NODE_ENV || 'dev'
const envSettings = require(`./.env.${environment}.js`)

export default {
  // This is a setting added to use env.
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - nuxt-default-project',
    title: 'nuxt-default-project',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    './plugins/air-vuetify.js',
    './plugins/dayjs.js',
    './plugins/firebase.js',
    './plugins/firebase.auth.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  // Uncomment if you want to use per-page permission settings.
  // router: {
  //   middleware: ['authenticated'],
  //   /* extends route to add meta. */
  //   extendRoutes(routes) {
  //     routes.forEach((route) => {
  //       const meta = pagePermissions[route.name] || []
  //       route.meta = {
  //         requiredPermissions: meta,
  //       }
  //     })
  //   },
  // },

  // Set parameters to connect firebase from .env.
  publicRuntimeConfig: {
    apiKey: envSettings.apiKey,
    authDomain: envSettings.authDomain,
    databaseURL: envSettings.databaseURL,
    projectId: envSettings.projectId,
    storageBucket: envSettings.storageBucket,
    messagingSenderId: envSettings.messagingSenderId,
    appId: envSettings.appId,
    vapidKey: envSettings.vapidKey,
  },

  // For transition.
  transition: {
    name: 'slide-x-transition',
    mode: 'out-in',
    duration: 300,
  },
  layoutTransition: {
    name: 'slide-x-transition',
    mode: 'out-in',
    duration: 300,
  },
}
