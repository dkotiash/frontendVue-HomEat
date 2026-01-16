<template>
  <div class="panel">
    <h2 style="margin-top: 0; margin-bottom: 20px;">
      {{ isEditing ? 'Rezept bearbeiten' : 'Rezepte hinzufügen' }}
    </h2>

    <form @submit.prevent="submitForm" class="form-wrapper">

      <div class="left-column">
        <div class="image-preview-box" @click="triggerFileInput">
          <img v-if="imagePreview" :src="imagePreview" alt="Vorschau" class="preview-img" />
          <span v-else class="placeholder-text">Bild-Vorschau</span>
        </div>

        <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" style="display: none;" />

        <div class="image-actions">
          <button class="btn btn-peach" type="button" @click="triggerFileInput">
            {{ imagePreview ? 'Bild ändern' : 'Bild hinzufügen' }}
          </button>
          <button v-if="imagePreview" class="btn btn-peach" type="button" @click="clearImage" style="opacity: 0.8; font-size: 0.9em;">
            Entfernen
          </button>
        </div>
      </div>

      <div class="right-column">
        <div class="form-group">
          <label class="label">Titel:</label>
          <input class="input-dark" v-model="localTitle" placeholder="Name des Rezepts" required />
        </div>

        <div class="form-group">
          <label class="label">Beschreibung:</label>
          <textarea class="input-dark textarea-dark" v-model="localDescription" rows="5" placeholder="Wie wird es zubereitet?"></textarea>
        </div>

        <div class="form-group">
          <label class="label">Zutat(en):</label>
          <div class="ingredient-row" v-for="(ing, idx) in localIngredients" :key="idx">
            <input class="input-dark ing-name" v-model="ing.name" placeholder="Name" required />
            <input class="input-dark ing-qty" v-model="ing.quantity" placeholder="z. B. 200g" />
            <button class="circle-btn remove" type="button" @click="removeIngredient(idx)">–</button>
          </div>
          <button class="circle-btn add" type="button" @click="addIngredient" style="margin-top: 5px;">+</button>
        </div>
      </div>

      <div class="bottom-actions">
        <button class="btn btn-peach" type="submit" :disabled="loading">
          {{ isEditing ? 'Änderungen speichern' : 'Speichern' }}
        </button>
        <button v-if="isEditing" class="btn btn-peach" type="button" style="filter: grayscale(0.5);" @click="$emit('cancel')">
          Abbrechen
        </button>
        <span v-if="loading" style="margin-left: 10px; opacity: 0.7;">Lade...</span>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Recipe, Ingredient } from '@/types'

const props = defineProps<{
  initialData?: Recipe | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: { recipe: Partial<Recipe>, file: File | null }): void
  (e: 'cancel'): void
}>()

const localTitle = ref('')
const localDescription = ref('')
const localIngredients = ref<Ingredient[]>([{ name: '', quantity: '' }])
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const isEditing = computed(() => !!props.initialData?.id)

watch(() => props.initialData, (newData) => {
  if (newData) {
    localTitle.value = newData.title
    localDescription.value = newData.description || ''
    localIngredients.value = newData.ingredients?.length ? newData.ingredients.map(i => ({ ...i })) : [{ name: '', quantity: '' }]
    imagePreview.value = newData.imageUrl || null
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  localTitle.value = ''
  localDescription.value = ''
  localIngredients.value = [{ name: '', quantity: '' }]
  imagePreview.value = null
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

defineExpose({ resetForm })

function addIngredient() { localIngredients.value.push({ name: '', quantity: '' }) }
function removeIngredient(idx: number) {
  if (localIngredients.value.length > 1) localIngredients.value.splice(idx, 1)
  else localIngredients.value[0] = { name: '', quantity: '' }
}

function triggerFileInput() { fileInput.value?.click() }
function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  selectedFile.value = f
  if (f) {
    const reader = new FileReader()
    reader.onload = () => { imagePreview.value = String(reader.result) }
    reader.readAsDataURL(f)
  }
}
function clearImage() {
  selectedFile.value = null
  imagePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function submitForm() {
  const cleanedIngredients = localIngredients.value
    .map(i => ({ name: i.name.trim(), quantity: (i.quantity || '').trim() }))
    .filter(i => i.name.length > 0)

  const payload: Partial<Recipe> = {
    id: props.initialData?.id,
    title: localTitle.value.trim(),
    description: localDescription.value.trim(),
    ingredients: cleanedIngredients,
    ownerId: props.initialData?.ownerId
  }

  emit('save', { recipe: payload, file: selectedFile.value })
}
</script>

<style scoped>
.panel { background: rgba(28, 28, 28, 0.6); padding: 30px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); color: white; }
.form-wrapper { display: grid; grid-template-columns: 300px 1fr; gap: 30px; align-items: start; }
.left-column, .right-column { display: flex; flex-direction: column; gap: 15px; }
.image-preview-box { width: 100%; aspect-ratio: 1 / 1; background: rgba(0, 0, 0, 0.3); border: 1px dashed rgba(255, 255, 255, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.image-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.input-dark { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px 15px; color: white; font-size: 1rem; outline: none; width: 100%; box-sizing: border-box; }
.input-dark:focus { border-color: #ffb08a; }
.textarea-dark { resize: vertical; min-height: 100px; }
.ingredient-row { display: flex; gap: 10px; margin-bottom: 8px; }
.ing-name { flex: 2; }
.ing-qty { flex: 1; }
.circle-btn { width: 36px; height: 36px; border-radius: 50%; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.circle-btn.add { background: #ffccaa; color: #2c1810; width: 40px; height: 40px; font-size: 1.5rem; }
.circle-btn.remove { background: rgba(255, 255, 255, 0.1); color: #ffb08a; }
.btn-peach { background: linear-gradient(135deg, #ffccaa 0%, #ff9676 100%); color: #2c1810; font-weight: 700; border-radius: 30px; border: none; padding: 10px 24px; cursor: pointer; }
.btn-peach:disabled { opacity: 0.6; }
.bottom-actions { grid-column: 1 / -1; margin-top: 20px; display: flex; gap: 15px; align-items: center; }
@media (max-width: 768px) { .form-wrapper { grid-template-columns: 1fr; } }
</style>
