<template>
  <section>
    <p v-if="loading">Lade Daten...</p>
    <p v-else-if="error">Fehler: {{ error }}</p>
    <ul v-else>
      <li v-for="todo in todos" :key="todo.title" class="rezept-card">
        <h3>{{ todo.title }}</h3>
        <p>{{ todo.description }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { fetchTodos, type HomEatEntry } from "@/services/api.ts"

const todos = ref<HomEatEntry[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    todos.value = await fetchTodos()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
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


