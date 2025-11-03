<template>
  <section>
    <p v-if="loading">Lade Daten...</p>
    <p v-else-if="error">Fehler: {{ error }}</p>
    <ul v-else>
      <li v-for="item in items" :key="item.title" class="rezept-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from "vue"
import type { HomEatEntry } from "@/types"


// реактивні змінні
const items: Ref<HomEatEntry[]> = ref([])
const loading = ref(true)
const error = ref<string | null>(null)

// 🧩 функція для GET-запиту (тільки завантаження даних)
async function loadRecipes() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
  const endpoint = `${baseUrl}/todos1`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)

    const data: HomEatEntry[] = await res.json()
    items.value = data
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

// ⚙️ виконується при монтуванні компонента
onMounted(async () => {
  await loadRecipes()
})


</script>

<style scoped>
.rezept-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 12px;
  margin: 10px 0;
  background-color: #f8f8f8;
}
</style>


