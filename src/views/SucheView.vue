<template>
  <div class="container">
    <h2>Suche</h2>
    <div class="panel">
      <div class="row" style="gap:12px; align-items:center;">
        <input
          class="input"
          v-model="q"
          @input="filterLocal"
          placeholder="Suche nach Titel, Beschreibung oder Zutat…"
        />
        <button class="btn" @click="loadFromApi" :disabled="loading">Neu laden</button>

        <span v-if="loading">Lade…</span>
        <span v-if="error" style="color:#ffb3b3">Fehler: {{ error }}</span>
      </div>
    </div>

    <div class="panel" v-if="results.length">
      <h3>Ergebnisse ({{ results.length }})</h3>
      <ul style="list-style:none; padding:0; margin:12px 0 0;">
        <li v-for="r in results" :key="r.id" class="panel" style="margin-bottom:12px;">
          <h4 style="margin:0 0 6px">{{ r.title }}</h4>
          <p v-if="r.description" style="margin:0 0 8px; opacity:.9">{{ r.description }}</p>
          <img v-if="r.imageUrl" :src="r.imageUrl" style="max-width:240px;border-radius:10px;border:1px solid rgba(255,255,255,.2)" />
          <div v-if="r.ingredients?.length">
            <h5 style="margin:10px 0 6px;">Zutaten:</h5>
            <ul style="margin:0; padding-left:18px;">
              <li v-for="(ing, i) in r.ingredients" :key="i">
                {{ ing.name }}<span v-if="ing.quantity"> — {{ ing.quantity }}</span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>

    <div class="panel" v-else-if="!loading && allRecipes.length > 0">
      <p>Keine Treffer für "{{ q }}".</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Recipe } from '@/types'

const q = ref('')
const allRecipes = ref<Recipe[]>([]) // Hier speichern wir ALLE Rezepte als "Backup"
const results = ref<Recipe[]>([])    // Hier sind nur die, die gerade angezeigt werden
const loading = ref(false)
const error = ref<string | null>(null)
const base = import.meta.env.VITE_BACKEND_BASE_URL

function computeImageUrl(r: Recipe): string | undefined {
  const first = r.images && r.images.length > 0 ? r.images[0] : undefined
  return first ? `${base}/api/images/${first.id}` : undefined
}

// 1. Daten vom Server holen (wird beim Start ausgeführt)
async function loadFromApi() {
  loading.value = true
  error.value = null
  try {
    // Wir holen ALLES (kein Filter hier, das macht das Frontend)
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const raw = (await res.json()) as Recipe[]

    // Bilder verarbeiten und speichern
    const processed = raw.map(r => ({
      ...r,
      imageUrl: r.imageUrl ?? computeImageUrl(r)
    }))

    allRecipes.value = processed // Backup aller Daten
    filterLocal()                // Ergebnisse initial füllen
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function filterLocal() {
  const rawInput = q.value.toLowerCase()
  // Teilt bei Komma oder Leerzeichen
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

    // HIER IST DIE ÄNDERUNG:
    // .some() bedeutet: Es reicht, wenn EINER der Suchbegriffe gefunden wird.
    return searchTerms.some(term => textToSearch.includes(term))
  })
}

// Startet sofort beim Laden der Seite
onMounted(() => {
  loadFromApi()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
.row { display:flex; }
</style>
