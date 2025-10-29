<template>
  <div class="rezept-card">
    <h3>{{ rezept.name }}</h3>
    <p>{{ rezept.beschreibung }}</p>
  </div>
</template>

<script>
export default {
  name: "Rezept",
  props: {
    rezept: {
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


