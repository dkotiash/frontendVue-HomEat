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
        <li v-for="r in results" :key="r.id" class="panel result-item">

          <div class="top-buttons">
            <button
              class="icon-btn"
              @click="toggleComments(r.id!)"
              :title="showCommentsId === r.id ? 'Kommentare schließen' : 'Kommentare anzeigen'"
            >
              💬
            </button>

            <button
              class="icon-btn heart-btn"
              @click="toggleFavorite(r)"
              title="Zu Favoriten hinzufügen"
            >
              {{ isFavorite(r.id!) ? '❤️' : '🤍' }}
            </button>
          </div>

          <h4 style="margin:0 0 12px; font-size: 1.2em; padding-right: 80px;">{{ r.title }}</h4>

          <img
            v-if="r.imageUrl"
            :src="r.imageUrl"
            style="max-width:240px; border-radius:10px; border:1px solid rgba(255,255,255,.2); display:block; margin-bottom: 12px;"
          />

          <div v-if="!isExpanded(r.id)">
            <p class="short-description">{{ r.description }}</p>
            <div style="margin-top:10px;">
              <button class="btn btn-peach" @click="toggleExpand(r.id!)">Öffnen</button>
            </div>
          </div>

          <div v-else>
            <p style="margin:0 0 8px; opacity:.9; white-space: pre-wrap; line-height: 1.5;">{{ r.description }}</p>
            <div v-if="r.ingredients?.length">
              <h5 style="margin:16px 0 6px;">Zutaten:</h5>
              <ul style="margin:0; padding-left:18px;">
                <li v-for="(ing, i) in r.ingredients" :key="i">
                  {{ ing.name }}<span v-if="ing.quantity"> — {{ ing.quantity }}</span>
                </li>
              </ul>
            </div>
            <div style="margin-top: 20px;">
              <button class="btn" style="background: transparent; border: 1px solid #ccc;" @click="toggleExpand(r.id!)">Schließen</button>
            </div>
          </div>

          <div v-if="showCommentsId === r.id" class="comments-section">
            <div class="divider"></div>
            <h5>Bewertungen & Vorschläge</h5>

            <div v-if="getComments(r.id!).length > 0" class="comments-list">
              <div v-for="c in getComments(r.id!)" :key="c.id" class="comment-bubble">
                <div class="comment-header">
                  <span class="comment-user">{{ c.userName }}</span>
                  <span class="comment-date">{{ formatDate(c.date) }}</span>
                </div>
                <p class="comment-text">{{ c.text }}</p>
              </div>
            </div>
            <p v-else style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 15px;">Noch keine Bewertungen.</p>

            <div class="comment-input-area">
              <textarea
                class="textarea input-comment"
                v-model="newCommentText"
                placeholder="Schreibe deine Meinung oder einen Tipp..."
                rows="2"
              ></textarea>
              <button class="btn btn-peach btn-small" @click="addComment(r.id!)">Senden</button>
            </div>
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
import { useAuth0 } from '@auth0/auth0-vue'

// --- TYPEN ---
interface Comment {
  id: number
  userName: string
  text: string
  date: string
}

// --- SETUP ---
const { user, isAuthenticated } = useAuth0()
const q = ref('')
const allRecipes = ref<Recipe[]>([])
const results = ref<Recipe[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const base = import.meta.env.VITE_BACKEND_BASE_URL

// Status Variablen
const expandedIds = ref<number[]>([])
const favoriteIds = ref<number[]>([])

// NEU: Kommentare
const showCommentsId = ref<number | null>(null)
const commentsStore = ref<Record<number, Comment[]>>({})
const newCommentText = ref('')

// --- KOMMENTAR LOGIK ---

function loadComments() {
  const stored = localStorage.getItem('homeat_comments')
  if (stored) {
    commentsStore.value = JSON.parse(stored)
  }
}

function saveComments() {
  localStorage.setItem('homeat_comments', JSON.stringify(commentsStore.value))
}

function getComments(recipeId: number): Comment[] {
  return commentsStore.value[recipeId] || []
}

function toggleComments(recipeId: number) {
  if (showCommentsId.value === recipeId) {
    showCommentsId.value = null // Zuklappen
  } else {
    showCommentsId.value = recipeId // Aufklappen
    newCommentText.value = '' // Textfeld leeren
  }
}

function addComment(recipeId: number) {
  if (!newCommentText.value.trim()) return

  const userName = isAuthenticated.value && user.value?.name ? user.value.name : 'Gast'

  const newComment: Comment = {
    id: Date.now(),
    userName: userName,
    text: newCommentText.value.trim(),
    date: new Date().toISOString()
  }

  // Array initialisieren falls noch nicht vorhanden
  if (!commentsStore.value[recipeId]) {
    commentsStore.value[recipeId] = []
  }

  // Hinzufügen & Speichern
  commentsStore.value[recipeId].push(newComment)
  saveComments()
  newCommentText.value = ''
}

function formatDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour:'2-digit', minute:'2-digit' })
}

// --- RESTLICHE LOGIK (Suche, Bilder, Favoriten etc.) ---

function computeImageUrl(r: Recipe): string | undefined {
  const first = r.images && r.images.length > 0 ? r.images[0] : undefined
  return first ? `${base}/api/images/${first.id}` : undefined
}

function loadFavorites() {
  const stored = localStorage.getItem('homeat_favorites')
  if (stored) favoriteIds.value = JSON.parse(stored)
}

function isFavorite(id: number): boolean { return favoriteIds.value.includes(id) }

async function toggleFavorite(recipe: Recipe) {
  if (!recipe.id) return

  const isFav = isFavorite(recipe.id)

  // 1. Lokal umschalten (Herz rot/weiß machen)
  if (isFav) {
    favoriteIds.value = favoriteIds.value.filter(fid => fid !== recipe.id)
  } else {
    favoriteIds.value.push(recipe.id)
  }
  localStorage.setItem('homeat_favorites', JSON.stringify(favoriteIds.value))

  // 2. SERVER UPDATE: Echte Likes zählen
  // Wir erhöhen oder verringern den Zähler im Rezept objekt
  const currentLikes = recipe.likes || 0
  const newLikes = isFav ? Math.max(0, currentLikes - 1) : currentLikes + 1

  // Optimistische UI-Update (damit es sofort sichtbar ist)
  recipe.likes = newLikes

  try {
    // Wir senden das ganze Rezept mit der neuen Like-Zahl an den Server
    // HINWEIS: Das funktioniert nur, wenn dein Backend "likes" speichert!
    await fetch(`${base}/HomEat/${recipe.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...recipe,
        likes: newLikes
      })
    })
  } catch (e) {
    console.error("Konnte Likes nicht speichern:", e)
  }
}

function toggleExpand(id: number) {
  if (expandedIds.value.includes(id)) expandedIds.value = expandedIds.value.filter(x => x !== id)
  else expandedIds.value.push(id)
}
function isExpanded(id: number | undefined): boolean {
  if(!id) return false
  return expandedIds.value.includes(id)
}

async function loadFromApi() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = (await res.json()) as Recipe[]
    const processed = raw.map(r => ({ ...r, imageUrl: r.imageUrl ?? computeImageUrl(r) }))
    allRecipes.value = processed
    filterLocal()
  } catch (e: unknown) { error.value = String(e) } finally { loading.value = false }
}

function filterLocal() {
  const rawInput = q.value.toLowerCase()
  const searchTerms = rawInput.split(/[ ,]+/).filter(Boolean)
  if (searchTerms.length === 0) { results.value = allRecipes.value; return }
  results.value = allRecipes.value.filter(r => {
    const textToSearch = [r.title, r.description, ...(r.ingredients?.map(i => i.name) ?? [])].join(' ').toLowerCase()
    return searchTerms.some(term => textToSearch.includes(term))
  })
}

onMounted(() => {
  loadFromApi()
  loadFavorites()
  loadComments()
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px; }
.row { display:flex; }
.panel {
  background: rgba(28, 28, 28, 0.6); padding: 20px; border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;
}
.result-item { position: relative; }

/* Buttons Oben Rechts */
.top-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0;
  opacity: 0.8;
}
.icon-btn:hover { transform: scale(1.2); opacity: 1; }
.heart-btn { font-size: 1.5rem; }

/* Short Desc */
.short-description {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden; text-overflow: ellipsis; opacity: 0.8; margin-bottom: 8px;
}

/* Button Styles */
.btn-peach {
  background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%); color: #2c1810;
  font-weight: 700; border-radius: 30px; border: none; padding: 8px 20px; cursor: pointer;
}
.btn-small { padding: 6px 14px; font-size: 0.9rem; }

/* --- KOMMENTAR STYLES --- */
.comments-section {
  margin-top: 20px;
  animation: fadeIn 0.3s ease-out;
}

.divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 15px 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.comment-bubble {
  background: rgba(0,0,0,0.3);
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.comment-user {
  font-weight: bold;
  color: #ffb08a;
}

.comment-date {
  opacity: 0.5;
}

.comment-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
  white-space: pre-wrap;
}

.comment-input-area {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.input-comment {
  flex: 1;
  min-height: 40px;
  background: rgba(0,0,0,0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
