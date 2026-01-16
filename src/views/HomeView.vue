<template>
  <div class="home-wrapper">

    <div v-if="authLoading || loadingData">Lade Daten...</div>

    <div v-else class="content-container">

      <div class="welcome-panel">
        <h1>Willkommen bei HomEat 🍳</h1>

        <div v-if="!isAuthenticated">
          <p class="subtitle">Bitte melde dich an, um fortzufahren.</p>
          <button class="big-btn login-btn" @click="login">🔐 Anmelden</button>
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

      <div v-if="isAuthenticated && myFavorites.length > 0" class="favorites-section">
        <h2 style="margin-bottom: 20px;">Deine Favoriten ❤️</h2>

        <ul class="favorites-list">
          <li v-for="fav in myFavorites" :key="fav.id" class="fav-item-wrapper">

            <button
              class="heart-btn"
              @click.stop="toggleFavorite(fav)"
              title="Aus Favoriten entfernen"
            >
              ❤️
            </button>

            <RecipeCard
              :recipe="fav"
              :isEditable="user?.sub === fav.ownerId"
            />
          </li>
        </ul>
      </div>

      <div v-else-if="isAuthenticated && !loadingData" style="margin-top:40px; opacity:0.6">
        <p>Noch keine Favoriten markiert. <br>Gehe zur Suche und klicke auf das ❤️!</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import type { Recipe } from '@/types'
import RecipeCard from '@/components/RecipeCard.vue'
import { useFavorites } from '@/composables/useFavorites'

const { loginWithRedirect, logout, user, isAuthenticated, isLoading: authLoading } = useAuth0()
const base = import.meta.env.VITE_BACKEND_BASE_URL

const { favoriteIds, loadFavorites, toggleFavorite } = useFavorites()

const allRecipes = ref<Recipe[]>([])
const loadingData = ref(false)

const login = () => loginWithRedirect()
const handleLogout = () => logout({ logoutParams: { returnTo: window.location.origin } })

function computeImageUrl(r: Recipe): string | undefined {
  const first = r.images && r.images.length > 0 ? r.images[0] : undefined
  return first ? `${base}/api/images/${first.id}` : undefined
}

async function loadRecipes() {
  loadingData.value = true
  try {
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error('Fehler beim Laden')
    const raw = (await res.json()) as Recipe[]

    allRecipes.value = raw.map(r => ({
      ...r,
      imageUrl: r.imageUrl ?? computeImageUrl(r)
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loadingData.value = false
  }
}

const myFavorites = computed(() => {
  return allRecipes.value.filter(r => r.id && favoriteIds.value.includes(r.id))
})

onMounted(() => {
  loadFavorites()
  loadRecipes()
})
</script>

<style scoped>
.home-wrapper {
  display: flex; flex-direction: column; align-items: center;
  min-height: 100vh; padding: 40px 20px; text-align: center;
}
.content-container {
  width: 100%; max-width: 800px; display: flex; flex-direction: column;
  gap: 40px; align-items: center;
}
.welcome-panel {
  background: rgba(28, 28, 28, 0.6); padding: 40px; border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); width: 100%;
}

.favorites-section { width: 100%; text-align: left; }
.favorites-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px;}

.fav-item-wrapper { position: relative; }

h1 { font-size: 3rem; margin-bottom: 0.5rem; color: var(--accent-1, #d8a77f); }
.subtitle { font-size: 1.5rem; margin-bottom: 2rem; opacity: 0.9; }
.description { font-size: 1.1rem; margin-bottom: 3rem; line-height: 1.6; opacity: 0.8; }

.action-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }

.big-btn {
  background: linear-gradient(135deg, #ffb08a 0%, #ff7d66 100%);
  color: #2b1a18; text-decoration: none; font-weight: bold;
  padding: 15px 25px; border-radius: 14px; font-size: 1.1rem; border: none; cursor: pointer;
}
.big-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }
.logout-btn { background: rgba(255, 255, 255, 0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }

.heart-btn {
  position: absolute; top: 20px; right: 20px;
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem;
  cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, background 0.2s;
}
.heart-btn:hover { transform: scale(1.1); background: rgba(0,0,0,0.6); }

@media (max-width: 600px) {
  .action-buttons { flex-direction: column; width: 100%; }
  .big-btn { width: 100%; }
}
</style>
