<template>
  <div class="container">
    <h2>Einkaufsliste 🛒</h2>

    <div v-if="!isAuthenticated" class="panel" style="text-align: center; padding: 40px;">
      <p style="font-size: 1.2rem; margin-bottom: 20px;">
        Bitte melde dich an, um deine persönliche Einkaufsliste zu nutzen.
      </p>
      <button class="btn btn-peach" @click="login">🔐 Anmelden</button>
    </div>

    <div v-else>
      <p style="opacity: 0.8; margin-bottom: 20px;">
        Liste für: <strong>{{ user?.name }}</strong>
      </p>

      <div class="panel input-group">
        <input
          class="input"
          v-model="newItem"
          @keyup.enter="addItem"
          placeholder="Was möchtest du kaufen? (z.B. Milch, Eier...)"
        />
        <button class="btn btn-peach" @click="addItem">Hinzufügen</button>
      </div>

      <div class="panel" v-if="items.length > 0">
        <ul class="shopping-list">
          <li v-for="(item, index) in items" :key="index" :class="{ 'done': item.done }">

            <div class="item-content" @click="toggleItem(index)">
              <span class="checkbox">{{ item.done ? '✅' : '⬜' }}</span>
              <span class="text">{{ item.text }}</span>
            </div>

            <button class="delete-btn" @click="deleteItem(index)" title="Löschen">✕</button>
          </li>
        </ul>

        <div style="text-align: right; margin-top: 15px;">
          <button class="btn-clear" @click="clearAll">Liste leeren</button>
        </div>
      </div>

      <div class="panel" v-else>
        <p style="opacity: 0.7; text-align: center;">Deine Liste ist leer. Zeit shoppen zu gehen! 🛍️</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

interface ShoppingItem {
  text: string
  done: boolean
}

const { user, isAuthenticated, loginWithRedirect } = useAuth0()

const newItem = ref('')
const items = ref<ShoppingItem[]>([])

const login = () => loginWithRedirect()


const storageKey = computed(() => {
  if (!isAuthenticated.value || !user.value?.sub) return null
  return `homeat_shopping_list_${user.value.sub}`
})

function loadItems() {
  if (!storageKey.value) {
    items.value = [] // Wenn kein User da ist, leere Liste
    return
  }
  const stored = localStorage.getItem(storageKey.value)
  if (stored) {
    items.value = JSON.parse(stored)
  } else {
    items.value = []
  }
}

watch(storageKey, () => {
  loadItems()
}, { immediate: true })
watch(items, (newVal) => {
  if (storageKey.value) {
    localStorage.setItem(storageKey.value, JSON.stringify(newVal))
  }
}, { deep: true })

function addItem() {
  const text = newItem.value.trim()
  if (!text) return

  items.value.unshift({ text, done: false })
  newItem.value = ''
}

function toggleItem(index: number) {
  const item = items.value[index]
  if (item) {
    item.done = !item.done
  }
}

function deleteItem(index: number) {
  if (items.value[index]) {
    items.value.splice(index, 1)
  }
}

function clearAll() {
  if(confirm("Möchtest du wirklich die ganze Liste löschen?")) {
    items.value = []
  }
}
</script>

<style scoped>
.container { max-width: 800px; margin: 0 auto; padding: 16px; }

.panel {
  background: rgba(28, 28, 28, 0.6);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.input-group { display: flex; gap: 12px; align-items: center; }
.input {
  flex: 1; background: #1e1c1c; color: white;
  border: 1px solid rgba(255,255,255,0.2); border-radius: 10px;
  padding: 12px; font-size: 1rem; outline: none;
}
.input:focus { border-color: #d8a77f; }

.shopping-list { list-style: none; padding: 0; margin: 0; }
.shopping-list li {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: rgba(255,255,255,0.05);
  border-radius: 12px; margin-bottom: 8px; transition: all 0.2s;
  border: 1px solid transparent;
}
.shopping-list li:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.1); }

.item-content { display: flex; align-items: center; gap: 15px; cursor: pointer; flex: 1; }
.checkbox { font-size: 1.2rem; }
.text { font-size: 1.1rem; transition: all 0.2s; }

.done .text { text-decoration: line-through; opacity: 0.5; color: #aaa; }
.done .checkbox { opacity: 0.6; }

.delete-btn {
  background: transparent; border: none; color: #ff6b6b;
  font-size: 1.2rem; cursor: pointer; padding: 5px 10px; opacity: 0.5;
  transition: opacity 0.2s;
}
.delete-btn:hover { opacity: 1; transform: scale(1.1); }

.btn-peach {
  background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%);
  color: #2c1810; font-weight: 700; border-radius: 30px;
  border: none; padding: 10px 24px; cursor: pointer;
}

.btn-clear {
  background: transparent; border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.6); padding: 6px 14px; border-radius: 20px;
  cursor: pointer; font-size: 0.85rem;
}
.btn-clear:hover { background: rgba(255,255,255,0.1); color: white; }

@media (max-width: 600px) {
  .input-group { flex-direction: column; align-items: stretch; }
  .btn-peach { width: 100%; }
}
</style>
