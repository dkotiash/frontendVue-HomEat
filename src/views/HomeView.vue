<template>
  <div class="home">
    <h1>Meine Lieblingsrezepte 🍽️</h1>
    <RezeptListe />
  </div>
</template>

<script lang="ts">
import RezeptListe from '@/components/RezeptListe.vue'

export default {
  name: 'HomeView',
  components: { RezeptListe: RezeptListe }
}
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>
