// src/types.ts

// ---- доменні сутності (узгоджено з твоїм беком) ----
export type Ingredient = {
  name: string;
  quantity: string;
};

export type RecipeImage = {
  id: number;
  filename: string;
  contentType: string;
  size: number;
};

export type Recipe = {
  id: number;
  title: string;
  description: string;
  ingredients: Ingredient[];
  images?: RecipeImage[]; // бек може повертати масив (OneToMany)
};

// DTO на створення рецепта
export type CreateRecipeDTO = {
  title: string;
  description: string;
  ingredients: Ingredient[];
};

// Відповідь від /api/images (твій ImageResponse)
export type ImageResponse = {
  id: number;
  url: string;         // з контролера (ми його одразу використовуємо)
  filename: string;
  size: number;
  contentType: string;
  recipeId?: number | null;
};
