<template>
  <section>
    <h2>Rezepte hinzufügen</h2>

    <div class="panel">
      <form @submit.prevent="save" class="form-grid">
        <!-- Прев’ю зображення -->
        <div class="image-preview">
          <img v-if="imagePreview" :src="imagePreview" alt="Bild" />
          <span v-else>Bild-Vorschau</span>
        </div>

        <div class="form-right">
          <label class="label">Titel:</label>
          <input class="input" v-model="titleField" required />

          <label class="label">Beschreibung:</label>
          <textarea class="textarea" v-model="descriptionField" rows="3" />

          <label class="label">Zutat(en):</label>
          <div class="row" v-for="(ing, idx) in ingredientsField" :key="idx">
            <input class="input" v-model="ing.name" placeholder="Name" required />
            <input class="input" v-model="ing.quantity" placeholder="z. B. 200g" />
            <button class="btn" type="button" @click="removeIngredient(idx)">–</button>
          </div>
          <button class="btn" type="button" @click="addIngredient">+</button>
        </div>

        <div class="row" style="grid-column: 1 / -1; gap:12px; align-items:center;">
          <input type="file" accept="image/*" @change="onFile" />
          <button class="btn" type="button" @click="uploadImage" :disabled="!file || uploading">
            Bild hinzufügen
          </button>
          <span v-if="uploading">Lade Bild…</span>
          <span v-if="imgError" style="color:#ffb3b3">Fehler: {{ imgError }}</span>
          <span v-if="imageUrl" style="opacity:.8">URL: {{ imageUrl }}</span>
        </div>

        <div class="row" style="grid-column: 1 / -1; justify-content:flex-start; gap:14px;">
          <button class="btn" type="submit" :disabled="loading">Speichern</button>
          <span v-if="loading">Speichert…</span>
          <span v-if="error" style="color:#ffb3b3">Fehler: {{ error }}</span>
        </div>
      </form>
    </div>

    <div class="panel">
      <h3>Gespeicherte Rezepte</h3>
      <div class="row" style="justify-content:space-between">
        <button class="btn" @click="loadRecipes" :disabled="loading">Rezepte neu laden</button>
        <span v-if="loading">Lade Daten…</span>
        <span v-if="error" style="color:#ffb3b3">Fehler: {{ error }}</span>
      </div>

      <p v-if="!loading && items.length === 0">Es sind noch keine Rezepte gespeichert.</p>

      <ul v-if="items.length > 0" style="list-style:none; padding:0; margin:12px 0 0;">
        <li v-for="(item, i) in items" :key="item.id ?? (item.title + i)" class="panel" style="margin-bottom:12px;">
          <h4 style="margin:0 0 6px">{{ item.title }}</h4>
          <p v-if="item.description" style="margin:0 0 8px; opacity:.9">{{ item.description }}</p>
          <img v-if="item.imageUrl" :src="item.imageUrl" style="max-width:240px;border-radius:10px;border:1px solid rgba(255,255,255,.2)" />
          <div v-if="item.ingredients && item.ingredients.length">
            <h5 style="margin:10px 0 6px;">Zutaten:</h5>
            <ul style="margin:0; padding-left:18px;">
              <li v-for="(ing, j) in item.ingredients" :key="j">
                {{ ing.name }}<span v-if="ing.quantity"> — {{ ing.quantity }}</span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import type { Ingredient, Recipe } from '@/types'

const items: Ref<Recipe[]> = ref([])
const loading = ref(true)
const error = ref<string | null>(null)

/* форма */
const titleField = ref('')
const descriptionField = ref('')
const ingredientsField = ref<Ingredient[]>([{ name: '', quantity: '' }])

/* зображення */
const file = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageUrl = ref<string | null>(null)
const uploading = ref(false)
const imgError = ref<string | null>(null)

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  file.value = f
  imagePreview.value = f ? URL.createObjectURL(f) : null
}

async function uploadImage() {
  if (!file.value) return
  uploading.value = true
  imgError.value = null
  try {
    const base = import.meta.env.VITE_BACKEND_BASE_URL
    const fd = new FormData()
    fd.append('file', file.value)
    const res = await fetch(`${base}/api/images`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as { id: number; url: string; filename: string }
    imageUrl.value = data.url
  } catch (e: unknown) {
    imgError.value = e instanceof Error ? e.message : String(e)
  } finally {
    uploading.value = false
  }
}

function addIngredient() {
  ingredientsField.value.push({ name: '', quantity: '' })
}
function removeIngredient(idx: number) {
  if (ingredientsField.value.length > 1) ingredientsField.value.splice(idx, 1)
  else ingredientsField.value[0] = { name: '', quantity: '' }
}

async function loadRecipes() {
  const base = import.meta.env.VITE_BACKEND_BASE_URL
  try {
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    items.value = await res.json()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  loading.value = true
  error.value = null

  const cleanedIngredients = ingredientsField.value
    .map(i => ({ name: i.name.trim(), quantity: (i.quantity || '').trim() }))
    .filter(i => i.name.length > 0)

  const data: Omit<Recipe, 'id'> = {
    title: titleField.value.trim(),
    description: descriptionField.value.trim(),
    ingredients: cleanedIngredients,
    imageUrl: imageUrl.value || undefined
  }

  try {
    const base = import.meta.env.VITE_BACKEND_BASE_URL
    const res = await fetch(`${base}/HomEat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const saved = await res.json()
    items.value.unshift(saved)

    titleField.value = ''
    descriptionField.value = ''
    ingredientsField.value = [{ name: '', quantity: '' }]
    file.value = null
    imagePreview.value = null
    imageUrl.value = null
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadRecipes)
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 18px;
}
.label { display:block; margin:8px 0 6px; opacity:.9 }
.row { display:flex; gap:8px; }
.form-right > * + * { margin-top: 10px; }
@media (max-width: 900px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
