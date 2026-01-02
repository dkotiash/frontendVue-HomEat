<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import type { Recipe } from '@/types'

const { loginWithRedirect, logout, user, isAuthenticated, isLoading: authLoading } = useAuth0()

// --- DATEN LADEN LOGIK ---
const allRecipes = ref<Recipe[]>([])
const loadingData = ref(false)
const favoriteIds = ref<number[]>([])
// NEU: Speichert das Rezept, das gerade im Popup offen ist (oder null, wenn keins offen ist)
const selectedRecipe = ref<Recipe | null>(null)

const base = import.meta.env.VITE_BACKEND_BASE_URL

const login = () => loginWithRedirect()
const handleLogout = () => logout({ logoutParams: { returnTo: window.location.origin } })

function loadFavorites() {
  const stored = localStorage.getItem('homeat_favorites')
  if (stored) {
    favoriteIds.value = JSON.parse(stored)
  }
}

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

// --- POPUP FUNKTIONEN ---
function openDetails(r: Recipe) {
  selectedRecipe.value = r
  // Scrollen auf der Hauptseite verhindern, solange Popup offen ist
  document.body.style.overflow = 'hidden'
}

function closeDetails() {
  selectedRecipe.value = null
  document.body.style.overflow = ''
}

// --- NEUE FUNKTION: ZUTATEN ZUR LISTE HINZUFÜGEN ---
function addIngredientsToShoppingList() {
  if (!selectedRecipe.value || !user.value?.sub) {
    alert("Bitte melde dich an, um die Einkaufsliste zu nutzen.")
    return
  }

  const storageKey = `homeat_shopping_list_${user.value.sub}`

  // 1. Aktuelle Liste laden
  let currentList: { text: string, done: boolean }[] = []
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    currentList = JSON.parse(stored)
  }

  // 2. Zutaten durchgehen und prüfen
  let addedCount = 0
  const ingredients = selectedRecipe.value.ingredients || []

  ingredients.forEach(ing => {
    // Wir bauen den Text für die Liste (z.B. "Mehl — 500g" oder nur "Mehl")
    const itemText = ing.quantity
      ? `${ing.name} (${ing.quantity})`
      : ing.name

    // 3. DUPLIKAT-CHECK (Verhindert doppelte Einträge)
    // Wir schauen, ob der Text (kleingeschrieben) schon existiert
    const exists = currentList.some(existing =>
      existing.text.toLowerCase().includes(ing.name.toLowerCase())
    )

    if (!exists) {
      // Wenn nicht vorhanden -> Hinzufügen (vorne anstellen)
      currentList.unshift({ text: itemText, done: false })
      addedCount++
    }
  })

  // 4. Speichern
  localStorage.setItem(storageKey, JSON.stringify(currentList))

  // Feedback an den User
  if (addedCount > 0) {
    alert(`${addedCount} Zutaten zur Einkaufsliste hinzugefügt! 🛒`)
  } else {
    alert("Diese Zutaten stehen schon auf deiner Liste! ✅")
  }
}

onMounted(() => {
  loadFavorites()
  loadRecipes()
})

</script>

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

        <div class="favorites-grid">
          <div v-for="fav in myFavorites" :key="fav.id" class="fav-card">
            <img v-if="fav.imageUrl" :src="fav.imageUrl" class="fav-img" @click="openDetails(fav)" />

            <div class="fav-content">
              <h4>{{ fav.title }}</h4>
              <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 12px;">{{ fav.ingredients?.length || 0 }} Zutaten</p>

              <button class="btn-peach-small" @click="openDetails(fav)">
                Öffnen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isAuthenticated && !loadingData" style="margin-top:40px; opacity:0.6">
        <p>Noch keine Favoriten markiert. <br>Gehe zur Suche und klicke auf das ❤️!</p>
      </div>

    </div>

    <div v-if="selectedRecipe" class="modal-overlay" @click.self="closeDetails">
      <div class="modal-content">
        <button class="close-icon" @click="closeDetails">✕</button>

        <h2 style="margin-top:0">{{ selectedRecipe.title }}</h2>

        <img
          v-if="selectedRecipe.imageUrl"
          :src="selectedRecipe.imageUrl"
          style="width:100%; max-height:250px; object-fit:cover; border-radius:12px; margin: 15px 0;"
        />

        <div style="display:flex; gap:10px; margin-bottom: 20px; flex-wrap: wrap;">
          <button class="btn-action" @click="addIngredientsToShoppingList">
            🛒 Auf die Einkaufsliste
          </button>
        </div>

        <p style="white-space: pre-wrap; line-height: 1.6; opacity: 0.9; margin-bottom: 20px;">
          {{ selectedRecipe.description }}
        </p>

        <div v-if="selectedRecipe.ingredients?.length">
          <h4 style="margin-bottom:10px; color: #ffb08a;">Zutaten:</h4>
          <ul style="padding-left: 20px;">
            <li v-for="(ing, i) in selectedRecipe.ingredients" :key="i" style="margin-bottom: 4px;">
              {{ ing.name }} <span v-if="ing.quantity" style="opacity:0.7"> — {{ ing.quantity }}</span>
            </li>
          </ul>
        </div>

        <div style="margin-top: 30px; text-align: right;">
          <button class="big-btn" @click="closeDetails" style="font-size: 1rem; padding: 10px 20px;">Schließen</button>
        </div>
      </div>
    </div>

  </div>
</template>

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

/* Favoriten Styles */
.favorites-section { width: 100%; text-align: left; }
.favorites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.fav-card {
  background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1); transition: transform 0.2s;
  display: flex; flex-direction: column;
}
.fav-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.1); }
.fav-img { width: 100%; height: 140px; object-fit: cover; cursor: pointer; }
.fav-content { padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }

/* Styles aus deinem Design */
h1 { font-size: 3rem; margin-bottom: 0.5rem; color: var(--accent-1, #d8a77f); }
.subtitle { font-size: 1.5rem; margin-bottom: 2rem; opacity: 0.9; }
.description { font-size: 1.1rem; margin-bottom: 3rem; line-height: 1.6; opacity: 0.8; }
.action-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
.big-btn { background: linear-gradient(135deg, #ffb08a 0%, #ff7d66 100%); color: #2b1a18; text-decoration: none; font-weight: bold; padding: 15px 25px; border-radius: 14px; font-size: 1.1rem; border: none; cursor: pointer; }
.big-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }
.logout-btn { background: rgba(255, 255, 255, 0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }

/* Kleiner Button im Grid */
.btn-peach-small {
  background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%);
  color: #2c1810; font-weight: 700; border-radius: 20px; border: none;
  padding: 6px 14px; cursor: pointer; font-size: 0.9em; width: 100%;
}
.btn-peach-small:hover { opacity: 0.9; }

.btn-action {
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff; padding: 8px 16px; border-radius: 20px; cursor: pointer;
  font-size: 0.9rem; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
}
.btn-action:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

/* MODAL / POPUP STYLES */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  backdrop-filter: blur(5px);   /* Weichzeichner für den Hintergrund */
  display: flex; justify-content: center; align-items: center;
  z-index: 2000; padding: 20px;

  /* Flexbox für perfekte Zentrierung */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px; /* Abstand zum Rand sicherstellen */
  box-sizing: border-box;
}
.modal-content {
  background: #1e1e1e; /* Dunkle Karte */
  padding: 30px; border-radius: 20px; max-width: 800px; width: 100%;
  max-height: 90vh; overflow-y: auto; position: relative;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  text-align: left; /* Text linksbündig im Popup */
  scrollbar-width: none;
}
.close-icon {
  position: absolute; top: 20px; right: 20px;
  background: transparent; border: none; color: white;
  font-size: 1.5rem; cursor: pointer; opacity: 0.7;
}
.close-icon:hover { opacity: 1; }

@media (max-width: 600px) {
  .favorites-grid { grid-template-columns: 1fr; }
}
</style>
