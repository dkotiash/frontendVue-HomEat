// Diese Datei kümmert sich um alle HTTP-Anfragen zum Backend
export interface HomEatEntry {
  title: string;
  description: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function fetchTodos(): Promise<HomEatEntry[]> {
  const res = await fetch(`${BASE_URL}/todos1`);
  if(!res.ok){
    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  }
  return await res.json();
}
