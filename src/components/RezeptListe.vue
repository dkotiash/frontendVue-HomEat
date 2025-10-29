<template>
  <div class="rezept-card">
    <h3>{{ rezepte.name }}</h3>
    <p>{{ rezepte.beschreibung }}</p>
  </div>
</template>

<script lang="ts">
export default {
  name: "RezeptListe",
  props: {
    rezepte: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.rezept-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 12px;
  margin: 10px 0;
  background-color: #f8f8f8;
}
</style>


