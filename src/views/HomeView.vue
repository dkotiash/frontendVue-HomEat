<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue' // <--- Neue Library

// Auth0 stellt diese Variablen bereit
const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0()

const login = () => {
  loginWithRedirect()
}

const handleLogout = () => {
  logout({ logoutParams: { returnTo: window.location.origin } })
}
</script>

<template>
  <div class="home-wrapper">
    <div v-if="isLoading">Lade Benutzerdaten...</div>

    <div v-else class="welcome-panel">
      <h1>Willkommen bei HomEat 🍳</h1>

      <div v-if="!isAuthenticated">
        <p class="subtitle">Bitte melde dich an, um fortzufahren.</p>
        <button class="big-btn login-btn" @click="login">
          🔐 Anmelden (Auth0)
        </button>
      </div>

      <div v-else>
        <p class="subtitle">Hallo, {{ user?.name }}!</p>
        <p class="description">Was möchtest du heute kochen?</p>

        <div class="action-buttons">
          <RouterLink to="/rezepte" class="big-btn">📝 Neues Rezept</RouterLink>
          <RouterLink to="/suche" class="big-btn">🔍 Suchen</RouterLink>
          <button class="big-btn logout-btn" @click="handleLogout">Ausloggen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ... deine CSS Klassen von vorhin ... */
.home-wrapper { display: flex; justify-content: center; align-items: center; height: 100%; text-align: center; }
.welcome-panel { background: rgba(28, 28, 28, 0.6); padding: 40px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); max-width: 600px; width: 100%; }
h1 { font-size: 3rem; margin-bottom: 0.5rem; color: var(--accent-1, #d8a77f); }
.subtitle { font-size: 1.5rem; margin-bottom: 2rem; opacity: 0.9; }
.description { font-size: 1.1rem; margin-bottom: 3rem; line-height: 1.6; opacity: 0.8; }
.action-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
.big-btn { background: linear-gradient(135deg, #ffb08a 0%, #ff7d66 100%); color: #2b1a18; text-decoration: none; font-weight: bold; padding: 15px 25px; border-radius: 14px; font-size: 1.1rem; border: none; cursor: pointer; }
.big-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }
.logout-btn { background: rgba(255, 255, 255, 0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
</style>
