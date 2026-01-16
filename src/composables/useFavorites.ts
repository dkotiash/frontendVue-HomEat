import { ref } from 'vue'
import type { Recipe } from '../types'

const favoriteIds = ref<number[]>([])
const base = import.meta.env.VITE_BACKEND_BASE_URL

export function useFavorites() {

  function loadFavorites() {
    const stored = localStorage.getItem('homeat_favorites')
    if (stored) {
      favoriteIds.value = JSON.parse(stored)
    }
  }

  function isFavorite(id: number | undefined): boolean {
    if (!id) return false
    return favoriteIds.value.includes(id)
  }

  async function toggleFavorite(recipe: Recipe) {
    if (!recipe.id) return

    const wasFavorite = isFavorite(recipe.id)

    if (wasFavorite) {
      favoriteIds.value = favoriteIds.value.filter(id => id !== recipe.id)
    } else {
      favoriteIds.value.push(recipe.id)
    }

    localStorage.setItem('homeat_favorites', JSON.stringify(favoriteIds.value))

    try {
      const shouldIncrease = !wasFavorite
      const res = await fetch(`${base}/HomEat/${recipe.id}/like?increase=${shouldIncrease}`, {
        method: 'POST'
      })

      if (res.ok) {
        const updated = await res.json()
        recipe.likes = updated.likes
      }
    } catch (e) {
      console.error("Помилка при оновленні лайка:", e)
    }
  }

  return {
    favoriteIds,
    loadFavorites,
    toggleFavorite,
    isFavorite
  }
}
