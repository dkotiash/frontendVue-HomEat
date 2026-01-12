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

// 1. NEU: Das Interface für Bewertungen
export interface Review {
  text: string
  rating: number
  authorName: string
}

// 2. UPDATE: Das Rezept-Interface erweitern
export interface Recipe {
  id?: number
  title: string
  description: string
  ingredients?: {
    name: string
    quantity: string
  }[]
  images?: {
    id: number
    // ... andere Bild-Felder
  }[]
  imageUrl?: string
  ownerId?: string

  // --- HIER SIND DIE NEUEN FELDER: ---
  likes?: number        // Damit TypeScript 'r.likes' kennt
  reviews?: Review[]    // Damit TypeScript 'r.reviews' kennt
  // -----------------------------------
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
