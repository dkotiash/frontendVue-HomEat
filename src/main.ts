import { createApp } from 'vue'
import { createAuth0 } from '@auth0/auth0-vue' // <--- Auth0 importieren
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(router)

// Auth0 Konfiguration
app.use(
  createAuth0({
    domain: 'dev-nr7ybuufu5e0f4na.us.auth0.com', // Deine Domain
    clientId: 'oEhtwOuGns6Ol80UeCWNtPumc8P8Aa5T',       // <--- Hier Client ID einfügen!
    authorizationParams: {
      redirect_uri: window.location.origin
    },
    cacheLocation: 'localstorage'
  })
)

app.mount('#app')
