<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>
  </header>

  <main>
    <!-- Тут буде відображатись HomeView -->
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 14px;
  text-align: center;
  margin-top: 2rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid #ccc;
  text-decoration: none;
  color: #444;
}

nav a:first-of-type {
  border: 0;
}

main {
  padding: 2rem;
}
</style>
