<template>
  <div class="layout">
    <!-- Ліва панель -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo logo--bg"></div>
        <div class="brand-title">HomEat</div>
      </div>
      <nav class="nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/rezepte">Rezepte hinzufügen</RouterLink>
        <RouterLink to="/suche">Suche</RouterLink>
      </nav>
    </aside>

    <!-- Центральна “скляна” область -->
    <main class="glass">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
/* локальних стилів тут не потрібно – все у main.css */
</style>
