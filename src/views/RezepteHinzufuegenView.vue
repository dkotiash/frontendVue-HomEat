<template>
  <section class="container">

    <RecipeForm
      ref="formRef"
      :initialData="recipeToEdit"
      :loading="loading"
      @save="handleSave"
      @cancel="cancelEdit"
    />

    <div v-if="error" class="error-msg">
      Fehler: {{ error }}
    </div>

    <div class="panel list-panel">
      <h3>Gespeicherte Rezepte</h3>

      <div class="refresh-row">
        <button class="btn btn-peach" @click="loadRecipes" :disabled="loading">
          Rezepte neu laden
        </button>
      </div>

      <p v-if="!loading && items.length === 0" style="margin-top: 20px; opacity: 0.7;">
        Es sind noch keine Rezepte gespeichert.
      </p>

      <ul v-if="items.length > 0" class="recipe-list">
        <RecipeCard
          v-for="(item, i) in items"
          :key="item.id ?? i"
          :recipe="item"
          :isEditable="true"
          @edit="startEditing"
          @delete="deleteRecipe"
        />
      </ul>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect, type Ref } from 'vue'
import type { Recipe } from '@/types'
import { useAuth0 } from '@auth0/auth0-vue'
import RecipeForm from '@/components/RecipeForm.vue'
import RecipeCard from '@/components/RecipeCard.vue'

const { user, isAuthenticated } = useAuth0()
const base = import.meta.env.VITE_BACKEND_BASE_URL

const items: Ref<Recipe[]> = ref([])
const loading = ref(true)
const error = ref<string | null>(null)
const recipeToEdit = ref<Recipe | null>(null)

const formRef = ref<InstanceType<typeof RecipeForm> | null>(null)

function computeImageUrl(r: Recipe): string | undefined {
  const first = r.images && r.images.length > 0 ? r.images[0] : undefined
  return first ? `${base}/api/images/${first.id}` : undefined
}

async function loadRecipes() {
  if (!user.value) return
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${base}/HomEat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw: Recipe[] = await res.json()
    const allRecipes = raw.map(r => ({ ...r, imageUrl: r.imageUrl ?? computeImageUrl(r) }))

    if (user.value && user.value.sub) {
      items.value = allRecipes.filter(r => r.ownerId === user.value?.sub)
    } else { items.value = [] }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally { loading.value = false }
}

async function handleSave({ recipe, file }: { recipe: Partial<Recipe>, file: File | null }) {
  loading.value = true
  error.value = null
  try {
    const payload = { ...recipe, ownerId: user.value?.sub }
    let savedRecipe: Recipe

    if (payload.id) {
      const res = await fetch(`${base}/HomEat/${payload.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      savedRecipe = await res.json()
    } else {
      const res = await fetch(`${base}/HomEat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      savedRecipe = await res.json()
    }

    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('recipeId', String(savedRecipe.id))
      await fetch(`${base}/api/images`, { method: 'POST', body: fd })
    }

    cancelEdit()

    if (!payload.id) {
      formRef.value?.resetForm()
    }

    await loadRecipes()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function deleteRecipe(id: number | undefined) {
  if (!id || !confirm('Wirklich löschen?')) return
  if (recipeToEdit.value?.id === id) cancelEdit()

  loading.value = true
  try {
    await fetch(`${base}/HomEat/${id}`, { method: 'DELETE' })
    await loadRecipes()
  } catch (e: unknown) { error.value = String(e) }
  finally { loading.value = false }
}

function startEditing(item: Recipe) {
  recipeToEdit.value = item
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  recipeToEdit.value = null
}

watchEffect(() => { if (isAuthenticated.value && user.value) loadRecipes() })
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px; }
.panel { background: rgba(28, 28, 28, 0.6); padding: 30px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); color: white; }
.list-panel { margin-top: 40px; }
.refresh-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
.recipe-list { list-style: none; padding: 0; margin: 0; }
.btn-peach { background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%); color: #2c1810; font-weight: 700; border-radius: 30px; border: none; padding: 10px 24px; cursor: pointer; transition: transform 0.1s; }
.btn-peach:hover { transform: scale(1.02); }
.btn-peach:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg { background: #ff4d4d33; border: 1px solid #ff4d4d; color: #ffb3b3; padding: 10px; border-radius: 8px; margin-top: 20px; text-align: center; }
</style>
