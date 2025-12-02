// src/api.ts
// Функції роботи з бекендом (fetch + типи)

import type { Recipe, CreateRecipeDTO, ImageResponse } from './types';

const BASE = (import.meta as any).env?.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
const API = `${BASE}/api`;

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} :: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return undefined as T;
}

// ---------- Recipes ----------
export async function getRecipes(): Promise<Recipe[]> {
  return http<Recipe[]>(`${API}/recipes`);
}

export async function createRecipe(dto: CreateRecipeDTO): Promise<Recipe> {
  return http<Recipe>(`${API}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

// ---------- Images ----------
export function imageUrl(id: number | string): string {
  // пряме посилання на байти
  return `${API}/images/${id}`;
}

export async function uploadImage(file: File, recipeId?: number): Promise<ImageResponse> {
  const fd = new FormData();
  fd.append('file', file);
  if (recipeId != null) fd.append('recipeId', String(recipeId));

  return http<ImageResponse>(`${API}/images`, {
    method: 'POST',
    body: fd, // НЕ ставимо Content-Type вручну!
  });
}

export async function deleteImage(id: number): Promise<void> {
  await http<void>(`${API}/images/${id}`, { method: 'DELETE' });
}
