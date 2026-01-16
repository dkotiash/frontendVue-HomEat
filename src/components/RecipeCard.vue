<template>
  <li class="panel recipe-card">

    <h4 class="card-title">{{ recipe.title }}</h4>

    <img
      v-if="recipe.imageUrl"
      :src="recipe.imageUrl"
      class="card-image"
    />

    <div class="stats-bar">
      <span class="stat-item" title="Likes">
        ❤️ {{ recipe.likes || 0 }} Likes
      </span>
      <button class="stat-item btn-link" @click="toggleComments">
        💬 {{ localComments.length }} Bewertungen
        <span class="arrow-icon">
          {{ showComments ? '▲' : '▼' }}
        </span>
      </button>
    </div>

    <div v-if="!isExpanded">
      <p class="short-description">
        {{ recipe.description }}
      </p>
      <div style="margin-top:10px;">
        <button class="btn btn-peach" @click="isExpanded = true">
          Öffnen
        </button>
      </div>
    </div>

    <div v-else>
      <p class="full-description">
        {{ recipe.description }}
      </p>

      <div v-if="recipe.ingredients && recipe.ingredients.length">
        <h5 class="ing-title">Zutaten:</h5>
        <ul class="ing-list">
          <li v-for="(ing, j) in recipe.ingredients" :key="j">
            {{ ing.name }}<span v-if="ing.quantity"> — {{ ing.quantity }}</span>
          </li>
        </ul>
      </div>

      <div class="action-row">
        <button class="btn btn-peach" style="border: 1px solid rgba(255,255,255,0.2); margin-right: auto;" @click="isExpanded = false">
          Schließen
        </button>

        <template v-if="isEditable">
          <button class="btn btn-peach" @click="$emit('edit', recipe)">Ändern</button>
          <button class="btn btn-peach" @click="$emit('delete', recipe.id)">Löschen</button>
        </template>
      </div>
    </div>

    <div v-if="showComments" class="comments-section">
      <div class="divider"></div>
      <h5>Meinungen der Community:</h5>

      <div v-if="localComments.length > 0" class="comments-list">
        <div v-for="c in localComments" :key="c.id" class="comment-bubble">
          <div class="comment-header">
            <span class="comment-user">{{ c.userName }}</span>
            <span class="comment-date">{{ formatDate(c.date) }}</span>
          </div>
          <p class="comment-text">{{ c.text }}</p>
        </div>
      </div>
      <p v-else class="no-comments">Noch keine Bewertungen vorhanden.</p>

      <div class="comment-input-area">
        <input
          class="input-dark"
          v-model="replyText"
          placeholder="Antworte als Autor..."
          @keyup.enter="addReply"
        />
        <button class="btn btn-peach btn-small" @click="addReply">Senden</button>
      </div>
    </div>

  </li>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Recipe } from '@/types'
import { useAuth0 } from '@auth0/auth0-vue'

const props = defineProps<{
  recipe: Recipe
  isEditable?: boolean
}>()

defineEmits<{
  (e: 'edit', recipe: Recipe): void
  (e: 'delete', id: number | undefined): void
}>()

const { user } = useAuth0()

const isExpanded = ref(false)
const showComments = ref(false)
const replyText = ref('')

interface Comment { id: number; userName: string; text: string; date: string }
const localComments = ref<Comment[]>([])

function loadComments() {
  const allComments = JSON.parse(localStorage.getItem('homeat_comments') || '{}')
  if (props.recipe.id) {
    localComments.value = allComments[props.recipe.id] || []
  }
}

function saveComments() {
  const allComments = JSON.parse(localStorage.getItem('homeat_comments') || '{}')
  if (props.recipe.id) {
    allComments[props.recipe.id] = localComments.value
    localStorage.setItem('homeat_comments', JSON.stringify(allComments))
  }
}

function toggleComments() {
  showComments.value = !showComments.value
}

function addReply() {
  if (!replyText.value.trim()) return

  const newComment: Comment = {
    id: Date.now(),
    userName: (user.value?.name || 'Unbekannt') + ' (Autor)',
    text: replyText.value.trim(),
    date: new Date().toISOString()
  }

  localComments.value.push(newComment)
  saveComments()
  replyText.value = ''
}

function formatDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', hour:'2-digit', minute:'2-digit'
  })
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.panel {
  background: rgba(28, 28, 28, 0.6);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  list-style: none;
  margin-bottom: 12px;
}

.card-title { margin: 0 0 12px; font-size: 1.2em; }

.card-image {
  max-width: 240px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,.2);
  display: block; margin-bottom: 12px;
}

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
.arrow-icon { font-size: 0.8em; opacity: 0.7; margin-left: 4px; }

.short-description {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden; text-overflow: ellipsis; opacity: 0.8; margin-bottom: 8px;
}
.full-description { margin: 0 0 8px; opacity: .9; white-space: pre-wrap; line-height: 1.5; }

.ing-title { margin: 16px 0 6px; }
.ing-list { margin: 0; padding-left: 18px; }

.action-row {
  margin-top: 20px; display: flex; gap: 10px;
  justify-content: flex-end; align-items: center;
}

.btn-peach {
  background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%);
  color: #2c1810; font-weight: 700; border-radius: 30px;
  border: none; padding: 8px 20px; cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.1s;
}
.btn-peach:hover { opacity: 0.9; transform: scale(1.02); }

.comments-section { margin-top: 15px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; }
.divider { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 12px; }
.comments-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.comment-bubble { background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; }
.comment-header { display: flex; justify-content: space-between; font-size: 0.8em; margin-bottom: 4px; opacity: 0.8; }
.comment-user { color: #ffb08a; font-weight: bold; }
.comment-text { margin: 0; font-size: 0.95em; }
.no-comments { opacity: 0.6; font-size: 0.9rem; }

.comment-input-area { display: flex; gap: 10px; margin-top: 10px; }
.input-dark {
  background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2);
  color: white; padding: 8px; border-radius: 6px; flex: 1; outline: none;
}
.input-dark:focus { border-color: #ffccaa; }
.btn-small { padding: 6px 12px; }
</style>
