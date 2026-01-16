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

export interface Review {
  text: string
  rating: number
  authorName: string
}

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
  }[]
  imageUrl?: string
  ownerId?: string

  likes?: number
  reviews?: Review[]
}

export interface CreateRecipeDTO {
  title: string
  description: string
  ingredients: Ingredient[]
  imageUrl?: string
}

export interface ImageResponse {
  id: number
  url: string
  filename: string
  size: number
  contentType: string
  recipeId?: number | null
}

export type RecipeWithImages = Recipe & {
  images: RecipeImage[]
}
