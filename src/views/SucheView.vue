<script setup lang="ts">
import { ref } from 'vue'
import type { Recipe } from '@/types'

const q = ref('')
const results = ref<Recipe[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function search() {
  loading.value = true
  error.value = null
  try {
    // тимчасово — фетчимо всі /HomEat і фільтруємо на клієнті
    const base = import.meta.env.VITE_BACKEND_BASE_URL
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const all = (await res.json()) as Recipe[]
    const s = q.value.trim().toLowerCase()
    results.value = s
      ? all.filter(r =>
        [r.title, r.description, ...(r.ingredients?.map(i => i.name) ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(s),
      )
      : all
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h2>Suche</h2>
    <div class="panel">
      <div class="row" style="gap:12px; align-items:center;">
        <input class="input" v-model="q" placeholder="Suche nach Titel, Beschreibung oder Zutat…" />
        <button class="btn" @click="search" :disabled="loading">Suchen</button>
        <span v-if="loading">Lade…</span>
        <span v-if="error" style="color:#ffb3b3">Fehler: {{ error }}</span>
      </div>
    </div>

    <div class="panel" v-if="results.length">
      <h3>Ergebnisse</h3>
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
    <div class="panel" v-else-if="!loading && q.trim()">
      <p>Keine Treffer.</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
.row { display:flex; }
</style>
