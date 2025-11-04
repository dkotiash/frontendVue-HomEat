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
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
  const endpoint = `${baseUrl}/HomEat` // Ваш оригінальний endpoint

  try {
    const res = await fetch(endpoint)
    // Перевірка статусу відповіді, як у вашому оригінальному коді
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${res.statusText}`)
    }
    // Отримуємо дані у форматі JSON
    const responseData: HomEatEntry[] = await res.json()
    // Очищаємо поточний масив перед заповненням,
    // або додаємо нові елементи, як у прикладі `loadThings`.
    // Якщо потрібно замінити: items.value = responseData
    // Якщо потрібно додати (як у прикладі з `loadThings`):
    items.value = [] // Очищуємо, якщо потрібно показати тільки нові дані
    responseData.forEach(item => items.value.push(item))
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


