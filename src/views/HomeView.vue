<template>
  <div class="home">
    <h1>Meine Lieblingsrezepte 🍽️</h1>
    <RezeptListe v-for="(r, index) in rezepte" :key="index" :rezepte="r" />
  </div>
</template>

<script lang="ts">
import RezeptListe from '@/components/RezeptListe.vue'

export default {
  name: 'HomeView',
  components: { RezeptListe: RezeptListe },
  data() {
    return {
      rezepte: [
        { name: "Pizza Margherita", beschreibung: "Mit Tomatensauce, Mozzarella und Basilikum" },
        { name: "Spaghetti Carbonara", beschreibung: "Mit Ei, Parmesan und Speck" },
        { name: "Caesar Salat", beschreibung: "Mit Hühnerbrust und Dressing" }
      ]
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>
