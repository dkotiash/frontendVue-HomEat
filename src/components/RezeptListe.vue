<template>
  <section>
    <h2>Neues Rezept hinzufügen</h2>

    <form @submit.prevent="save" class="form">
      <div class="field">
        <label>Titel</label>
        <input v-model="titleField" required />
      </div>

      <div class="field">
        <label>Beschreibung</label>
        <textarea v-model="descriptionField" rows="3" />
      </div>

      <div class="field">
        <label>Zutaten</label>
        <div v-for="(ing, idx) in ingredientsField" :key="idx" class="ingredient-row">
          <input v-model="ing.name" placeholder="Name" required />
          <input v-model="ing.quantity" placeholder="Menge" />
          <button type="button" @click="removeIngredient(idx)" aria-label="Entfernen">✖</button>
        </div>
        <button type="button" @click="addIngredient">Zutat hinzufügen</button>
      </div>

      <div class="actions">
        <button type="submit" :disabled="loading">Speichern</button>
        <span v-if="loading">Speichert…</span>
        <span v-if="error" class="error">Fehler: {{ error }}</span>
      </div>
    </form>

    <hr />

    <h2>Gespeicherte Rezepte</h2>
    <p v-if="loading && items.length === 0">Lade Daten…</p>
    <p v-else-if="error && items.length === 0">Fehler: {{ error }}</p>

    <ul>
      <li v-for="(item, i) in items" :key="item.id ?? (item.title + i)" class="rezept-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <ul class="zutaten-liste">
          <li v-for="(ing, j) in item.ingredients" :key="j">
            {{ ing.name }}<span v-if="ing.quantity"> — {{ ing.quantity }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import type { Ingredient, Recipe } from '@/types'

const items: Ref<Recipe[]> = ref([])
const loading = ref(true)
const error = ref<string | null>(null)

const titleField = ref('')
const descriptionField = ref('')
const ingredientsField = ref<Ingredient[]>([{ name: '', quantity: '' }])

async function loadRecipes() {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
  const endpoint = `${baseUrl}/HomEat`
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)
    const responseData: Recipe[] = await res.json()
    items.value = responseData
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function addIngredient() {
  ingredientsField.value.push({ name: '', quantity: '' })
}

function removeIngredient(idx: number) {
  if (ingredientsField.value.length > 1) {
    ingredientsField.value.splice(idx, 1)
  } else {
    ingredientsField.value[0] = { name: '', quantity: '' }
  }
}

async function save() {
  loading.value = true
  error.value = null

  const cleanedIngredients = ingredientsField.value
    .map(i => ({ name: i.name.trim(), quantity: (i.quantity || '').trim() }))
    .filter(i => i.name.length > 0)

  const data: Recipe = {
    title: titleField.value.trim(),
    description: descriptionField.value.trim(),
    ingredients: cleanedIngredients
  }

  try {
    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
    const endpoint = `${baseUrl}/HomEat`

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)

    const responseData: Recipe = await res.json()
    items.value.unshift(responseData)

    titleField.value = ''
    descriptionField.value = ''
    ingredientsField.value = [{ name: '', quantity: '' }]
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecipes()
})
</script>

<style scoped>
.form { margin-bottom: 1rem; }
.field { margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 4px; }
.ingredient-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
.actions { margin-top: 8px; }
.error { color: #b00020; margin-left: 8px; }
.rezept-card { border: 1px solid #ccc; border-radius: 8px; padding: 12px; margin: 8px 0; background: #fafafa; }
.zutaten-liste { margin: 8px 0 0 1rem; padding: 0; }
</style>
