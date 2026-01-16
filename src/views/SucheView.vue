<template>
  <div class="container">
    <h2>Suche 🔍</h2>

    <div class="panel search-panel">
      <div class="search-row">
        <input
          class="input-dark"
          v-model="q"
          @input="filterLocal"
          placeholder="Suche nach Titel, Beschreibung oder Zutat…"
        />
        <button class="btn btn-peach" @click="loadFromApi" :disabled="loading">
          Neu laden
        </button>
      </div>

      <div v-if="loading" style="margin-top: 10px; opacity: 0.7;">Lade Daten...</div>
      <div v-if="error" style="margin-top: 10px; color: #ffb3b3;">Fehler: {{ error }}</div>
    </div>

    <div v-if="results.length > 0" class="results-container">
      <h3 style="margin-bottom: 20px;">Ergebnisse ({{ results.length }})</h3>

      <ul class="results-list">
        <li v-for="r in results" :key="r.id" class="result-wrapper">

          <button
            class="heart-btn"
            @click.stop="toggleFavorite(r)"
            :title="isFavorite(r.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
          >
            {{ isFavorite(r.id) ? '❤️' : '🤍' }}
          </button>

          <RecipeCard
            :recipe="r"
            :isEditable="user?.sub === r.ownerId"
          />

        </li>
      </ul>
    </div>

    <div class="panel" v-else-if="!loading && allRecipes.length > 0">
      <p style="opacity: 0.8;">Keine Treffer für "{{ q }}".</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Recipe } from '@/types'
import { useAuth0 } from '@auth0/auth0-vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { useFavorites } from '@/composables/useFavorites'

const { user } = useAuth0()
const base = import.meta.env.VITE_BACKEND_BASE_URL

const { toggleFavorite, isFavorite, loadFavorites } = useFavorites()

const q = ref('')
const allRecipes = ref<Recipe[]>([])
const results = ref<Recipe[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

function computeImageUrl(r: Recipe): string | undefined {
  const first = r.images && r.images.length > 0 ? r.images[0] : undefined
  return first ? `${base}/api/images/${first.id}` : undefined
}

async function loadFromApi() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = (await res.json()) as Recipe[]

    const processed = raw.map(r => ({
      ...r,
      imageUrl: r.imageUrl ?? computeImageUrl(r)
    }))

    allRecipes.value = processed
    filterLocal()
  } catch (e: unknown) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

function filterLocal() {
  const rawInput = q.value.toLowerCase()
  const searchTerms = rawInput.split(/[ ,]+/).filter(Boolean)

  if (searchTerms.length === 0) {
    results.value = allRecipes.value
    return
  }

  results.value = allRecipes.value.filter(r => {
    const textToSearch = [
      r.title,
      r.description,
      ...(r.ingredients?.map(i => i.name) ?? [])
    ].join(' ').toLowerCase()
    return searchTerms.some(term => textToSearch.includes(term))
  })
}

onMounted(() => {
  loadFavorites()
  loadFromApi()
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px; }

.panel {
  background: rgba(28, 28, 28, 0.6); padding: 20px; border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;
}

.search-row { display: flex; gap: 12px; align-items: center; }

.input-dark {
  background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px; padding: 12px 15px; color: white; font-size: 1rem; flex: 1; outline: none;
}
.input-dark:focus { border-color: #ffb08a; }

.btn-peach {
  background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%);
  color: #2c1810; font-weight: 700; border-radius: 30px;
  border: none; padding: 10px 24px; cursor: pointer; white-space: nowrap;
}
.btn-peach:disabled { opacity: 0.6; }

.results-list { list-style: none; padding: 0; margin: 0; }
.result-wrapper { position: relative; margin-bottom: 15px; }

.heart-btn {
  position: absolute; top: 20px; right: 20px;
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem;
  cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, background 0.2s;
}
.heart-btn:hover { transform: scale(1.1); background: rgba(0,0,0,0.6); }

@media (max-width: 600px) {
  .search-row { flex-direction: column; }
  .btn-peach { width: 100%; }
}
</style>
