<template>
  <div class="home">
    <h1>Meine Lieblingsrezepte 🍽️</h1>

    <!-- тут ми відображаємо кожен рецепт через Unterkomponente -->
    <Rezept
      v-for="(r, index) in rezepte"
      :key="index"
      :rezept="r"
    />
  </div>
</template>

<script>
import Rezept from "@/components/Rezept.vue"

export default {
  name: "HomeView",
  components: { Rezept },
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
