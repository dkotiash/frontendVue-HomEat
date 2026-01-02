<template>
  <section>
    <h2>{{ editingId ? 'Rezept bearbeiten' : 'Rezepte hinzufügen' }}</h2>

    <div class="panel">
      <form @submit.prevent="save" class="form-grid">
        <div class="image-preview">
          <img v-if="imagePreview" :src="imagePreview" alt="Bild" />
          <span v-else>Bild-Vorschau</span>
        </div>

        <div class="form-right">
          <label class="label">Titel:</label>
          <input class="input" v-model="titleField" required />

          <label class="label">Beschreibung:</label>
          <textarea class="textarea" v-model="descriptionField" rows="3" style="white-space: pre-wrap;"></textarea>

          <label class="label">Zutat(en):</label>
          <div class="row" v-for="(ing, idx) in ingredientsField" :key="idx">
            <input class="input" v-model="ing.name" placeholder="Name" required />
            <input class="input" v-model="ing.quantity" placeholder="z. B. 200g" />
            <button class="btn" type="button" @click="removeIngredient(idx)">–</button>
          </div>
          <button class="btn" type="button" @click="addIngredient">+</button>
        </div>

        <input type="file" ref="fileInput" accept="image/*" @change="onFile" style="display: none;" />

        <div class="row" style="grid-column: 1 / -1; gap:12px; align-items:center;">
          <button class="btn" type="button" @click="triggerFileInput">
            {{ imagePreview ? 'Bild ändern' : 'Bild hinzufügen' }}
          </button>
          <button v-if="imagePreview" class="btn" type="button" @click="clearImage">Bild entfernen</button>
        </div>

        <div class="row" style="grid-column: 1 / -1; justify-content:flex-start; gap:14px; margin-top:10px;">
          <button class="btn" type="submit" :disabled="loading">
            {{ editingId ? 'Änderungen speichern' : 'Speichern' }}
          </button>
          <button v-if="editingId" class="btn" type="button" style="background-color: #666;" @click="cancelEdit">Abbrechen</button>
          <span v-if="loading">Verarbeite…</span>
          <span v-if="error" style="color:#ffb3b3">Fehler: {{ error }}</span>
        </div>
      </form>
    </div>

    <div class="panel">
      <h3>Gespeicherte Rezepte</h3>
      <div class="row" style="justify-content:space-between">
        <button class="btn" @click="loadRecipes" :disabled="loading">Rezepte neu laden</button>
      </div>

      <p v-if="!loading && items.length === 0">Es sind noch keine Rezepte gespeichert.</p>

      <ul v-if="items.length > 0" style="list-style:none; padding:0; margin:12px 0 0;">
        <li v-for="(item, i) in items" :key="item.id ?? (item.title + i)" class="panel" style="margin-bottom:12px;">

          <h4 style="margin:0 0 12px; font-size: 1.2em;">{{ item.title }}</h4>

          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            style="max-width:240px; border-radius:10px; border:1px solid rgba(255,255,255,.2); display:block; margin-bottom: 12px;"
          />

          <div class="stats-bar">
            <span class="stat-item" title="Simulierte Anzahl der Nutzer, die dies als Favorit haben">
              ❤️ {{ item.likes || 0 }} Likes
            </span>
            <button class="stat-item btn-link" @click="toggleComments(item.id!)">
              💬 {{ getCommentCount(item.id!) }} Bewertungen
              <span style="font-size:0.8em; opacity:0.7; margin-left:4px;">
                {{ showCommentsId === item.id ? '▲' : '▼' }}
              </span>
            </button>
          </div>

          <div v-if="!isExpanded(item.id)">
            <p class="short-description">
              {{ item.description }}
            </p>
            <div style="margin-top:10px;">
              <button class="btn btn-peach" @click="toggleExpand(item.id!)">
                Öffnen
              </button>
            </div>
          </div>

          <div v-else>
            <p style="margin:0 0 8px; opacity:.9; white-space: pre-wrap; line-height:1.5;">
              {{ item.description }}
            </p>

            <div v-if="item.ingredients && item.ingredients.length">
              <h5 style="margin:16px 0 6px;">Zutaten:</h5>
              <ul style="margin:0; padding-left:18px;">
                <li v-for="(ing, j) in item.ingredients" :key="j">
                  {{ ing.name }}<span v-if="ing.quantity"> — {{ ing.quantity }}</span>
                </li>
              </ul>
            </div>

            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
              <button class="btn btn-peach" style="border: 1px solid ; margin-right: auto;" @click="toggleExpand(item.id!)">
                Schließen
              </button>
              <button class="btn btn-peach" @click="startEditing(item)">Ändern</button>
              <button class="btn btn-peach" @click="deleteRecipe(item.id)">Löschen</button>
            </div>
          </div>

          <div v-if="showCommentsId === item.id" class="comments-section">
            <div class="divider"></div>
            <h5>Meinungen der Community:</h5>

            <div v-if="getComments(item.id!).length > 0" class="comments-list">
              <div v-for="c in getComments(item.id!)" :key="c.id" class="comment-bubble">
                <div class="comment-header">
                  <span class="comment-user">{{ c.userName }}</span>
                  <span class="comment-date">{{ formatDate(c.date) }}</span>
                </div>
                <p class="comment-text">{{ c.text }}</p>
              </div>
            </div>
            <p v-else style="opacity: 0.6; font-size: 0.9rem;">Noch keine Bewertungen vorhanden.</p>

            <div class="comment-input-area" style="margin-top:10px;">
              <input
                class="input"
                v-model="replyText"
                placeholder="Antworte als Autor..."
                @keyup.enter="addReply(item.id!)"
              />
              <button class="btn btn-peach" style="padding: 6px 12px;" @click="addReply(item.id!)">Senden</button>
            </div>
          </div>

        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, type Ref } from 'vue'
import type { Ingredient, Recipe } from '@/types'
import { useAuth0 } from '@auth0/auth0-vue'

// --- TYPEN ---
interface Comment {
  id: number
  userName: string
  text: string
  date: string
}

const { user, isAuthenticated } = useAuth0()

const items: Ref<Recipe[]> = ref([])
const loading = ref(true)
const error = ref<string | null>(null)

// Aufklapp-Status
const expandedIds = ref<number[]>([])

// Formular-Felder
const titleField = ref('')
const descriptionField = ref('')
const ingredientsField = ref<Ingredient[]>([{ name: '', quantity: '' }])
const editingId = ref<number | undefined>(undefined)

// Bild
const file = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Kommentare & Likes
const commentsStore = ref<Record<number, Comment[]>>({})
const showCommentsId = ref<number | null>(null)
const replyText = ref('')

const base = import.meta.env.VITE_BACKEND_BASE_URL

// --- FUNKTIONEN: Expandieren ---
function toggleExpand(id: number) {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter(x => x !== id)
  } else {
    expandedIds.value.push(id)
  }
}
function isExpanded(id: number | undefined): boolean {
  if (!id) return false
  return expandedIds.value.includes(id)
}

// --- FUNKTIONEN: Kommentare & Likes ---
function loadComments() {
  const stored = localStorage.getItem('homeat_comments')
  if (stored) commentsStore.value = JSON.parse(stored)
}
function saveComments() {
  localStorage.setItem('homeat_comments', JSON.stringify(commentsStore.value))
}
function getComments(recipeId: number): Comment[] {
  return commentsStore.value[recipeId] || []
}
function getCommentCount(recipeId: number): number {
  return getComments(recipeId).length
}
function toggleComments(recipeId: number) {
  if (showCommentsId.value === recipeId) showCommentsId.value = null
  else { showCommentsId.value = recipeId; replyText.value = '' }
}
function addReply(recipeId: number) {
  if (!replyText.value.trim()) return
  const newComment: Comment = {
    id: Date.now(),
    userName: (user.value?.name || 'Unbekannt') + ' (Autor)',
    text: replyText.value.trim(),
    date: new Date().toISOString()
  }
  if (!commentsStore.value[recipeId]) commentsStore.value[recipeId] = []
  commentsStore.value[recipeId].push(newComment)
  saveComments()
  replyText.value = ''
}
function formatDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour:'2-digit', minute:'2-digit' })
}


// --- RESTLICHE FUNKTIONEN (Bilder, Laden, Speichern) ---
function triggerFileInput() { fileInput.value?.click() }
function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  file.value = f
  if (f) {
    const reader = new FileReader(); reader.onload = () => { imagePreview.value = String(reader.result || '') }; reader.readAsDataURL(f)
  }
}
function clearImage() { file.value = null; imagePreview.value = null; if(fileInput.value) fileInput.value.value = '' }
function addIngredient() { ingredientsField.value.push({ name: '', quantity: '' }) }
function removeIngredient(idx: number) {
  if (ingredientsField.value.length > 1) ingredientsField.value.splice(idx, 1)
  else ingredientsField.value[0] = { name: '', quantity: '' }
}
function computeImageUrl(r: Recipe): string | undefined {
  const first = r.images && r.images.length > 0 ? r.images[0] : undefined
  return first ? `${base}/api/images/${first.id}` : undefined
}

function startEditing(item: Recipe) {
  editingId.value = item.id; titleField.value = item.title; descriptionField.value = item.description || ''
  if (item.ingredients && item.ingredients.length > 0) ingredientsField.value = item.ingredients.map(i => ({ ...i }))
  else ingredientsField.value = [{ name: '', quantity: '' }]
  imagePreview.value = item.imageUrl || null; file.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function cancelEdit() {
  editingId.value = undefined; titleField.value = ''; descriptionField.value = '';
  ingredientsField.value = [{ name: '', quantity: '' }]; clearImage()
}

async function loadRecipes() {
  if (!user.value) return
  loading.value = true
  try {
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw: Recipe[] = await res.json()
    const allRecipes = raw.map(r => ({ ...r, imageUrl: r.imageUrl ?? computeImageUrl(r) }))
    if (user.value && user.value.sub) {
      items.value = allRecipes.filter(r => r.ownerId === user.value?.sub)
    } else { items.value = [] }
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : String(e) } finally { loading.value = false }
}

async function save() {
  loading.value = true; error.value = null
  const cleanedIngredients = ingredientsField.value.map(i => ({ name: i.name.trim(), quantity: (i.quantity || '').trim() })).filter(i => i.name.length > 0)
  try {
    const payload = { title: titleField.value.trim(), description: descriptionField.value.trim(), ingredients: cleanedIngredients, ownerId: user.value?.sub }
    let savedRecipe: Recipe;
    if (editingId.value) {
      const res = await fetch(`${base}/HomEat/${editingId.value}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`Update fehlgeschlagen: ${res.status}`); savedRecipe = await res.json()
    } else {
      const res = await fetch(`${base}/HomEat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`Speichern fehlgeschlagen: ${res.status}`); savedRecipe = await res.json()
    }
    if (file.value) {
      const fd = new FormData(); fd.append('file', file.value); fd.append('recipeId', String(savedRecipe.id || editingId.value))
      await fetch(`${base}/api/images`, { method: 'POST', body: fd })
    }
    cancelEdit(); await loadRecipes()
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : String(e) } finally { loading.value = false }
}

async function deleteRecipe(id: number | undefined) {
  if (!id || !confirm('Wirklich löschen?')) return
  if (editingId.value === id) cancelEdit()
  loading.value = true
  try { await fetch(`${base}/HomEat/${id}`, { method: 'DELETE' }); await loadRecipes() }
  catch (e) { error.value = String(e) } finally { loading.value = false }
}

watchEffect(() => { if (isAuthenticated.value && user.value) loadRecipes() })
onMounted(() => { loadComments() })
</script>

<style scoped>
.form-grid { display: grid; grid-template-columns: 300px 1fr; gap: 18px; }
.label { display:block; margin:8px 0 6px; opacity:.9 }
.row { display:flex; gap:8px; }
.form-right > * + * { margin-top: 10px; }
.textarea { width: 100%; resize: vertical; font-family: inherit; }

/* CSS-Trick für "..." Text-Kürzung */
.short-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
  margin-bottom: 8px;
}

/* Pfirsich-Button Style */
.btn-peach {
  background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%);
  color: #2c1810;
  font-weight: 700;
  border-radius: 30px;
  border: none;
  padding: 8px 20px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.1s, opacity 0.2s;
}
.btn-peach:hover { opacity: 0.9; transform: scale(1.02); }
.btn-peach:active { transform: scale(0.98); }

/* STATS LEISTE */
.stats-bar {
  display: flex; gap: 20px; margin: 12px 0; padding: 8px 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 0.95rem;
}
.stat-item {
  display: flex; align-items: center; gap: 6px;
  color: #ffb08a; font-weight: bold;
}
.btn-link {
  background: transparent; border: none; cursor: pointer; padding: 0; font-family: inherit;
  transition: opacity 0.2s; color: #ffb08a; font-weight: bold;
}
.btn-link:hover { opacity: 0.8; text-decoration: underline; }

/* KOMMENTARE */
.comments-section { margin-top: 15px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; }
.divider { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 12px; }
.comments-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.comment-bubble { background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; }
.comment-header { display: flex; justify-content: space-between; font-size: 0.8em; margin-bottom: 4px; opacity: 0.8; }
.comment-user { color: #ffb08a; font-weight: bold; }
.comment-text { margin: 0; font-size: 0.95em; }
.comment-input-area { display: flex; gap: 10px; }

@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }
</style>
