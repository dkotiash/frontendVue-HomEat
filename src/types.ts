// src/types.ts

// ---- Domainen-Entitäten (abgestimmt mit Backend) ----
export interface Ingredient {
  name: string
  quantity: string
}

export interface RecipeImage {
  id: number
  filename: string
  contentType: string
  size: number
}

export interface Recipe {
  id: number
  title: string
  description: string
  ingredients: Ingredient[]
  images?: RecipeImage[]
  imageUrl?: string
}

// DTO für das Erstellen eines Rezepts
export interface CreateRecipeDTO {
  title: string
  description: string
  ingredients: Ingredient[]
  imageUrl?: string
}

// Antwort von /api/images (ImageResponse vom Backend)
export interface ImageResponse {
  id: number
  url: string
  filename: string
  size: number
  contentType: string
  recipeId?: number | null
}

// Hilfstyypen für Rezepte mit Bildern
export type RecipeWithImages = Recipe & {
  images: RecipeImage[]
}
