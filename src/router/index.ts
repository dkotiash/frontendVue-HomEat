import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RezeptListe from '@/components/RezeptListe.vue'
import SucheView from '@/views/SucheView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/rezepte', name: 'rezepte', component: RezeptListe },
  { path: '/suche', name: 'suche', component: SucheView } // temporär, bis eine Suche-View vorhanden ist
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
