<template>
  <div class="home-wrapper">
    <div class="welcome-panel">
      <h1>Willkommen bei HomEat 🍳</h1>
      <p class="subtitle">Dein persönliches digitales Kochbuch.</p>

      <p class="description">
        Hier kannst du deine Lieblingsrezepte speichern, verwalten und jederzeit wiederfinden.
        Was möchtest du tun?
      </p>

      <div class="action-buttons">
        <RouterLink to="/rezepte" class="big-btn">
          📝 Neues Rezept hinzufügen
        </RouterLink>

        <RouterLink to="/suche" class="big-btn">
          🔍 Rezept suchen
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Wir brauchen hier keine Logik mehr, da es nur eine Startseite ist
</script>

<style scoped>
.home-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.welcome-panel {
  background: rgba(28, 28, 28, 0.6); /* Leicht transparent */
  padding: 40px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: var(--accent-1, #d8a77f); /* Nutzt deine Farbe */
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.description {
  font-size: 1.1rem;
  margin-bottom: 3rem;
  line-height: 1.6;
  opacity: 0.8;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.big-btn {
  background: linear-gradient(135deg, #ffb08a 0%, #ff7d66 100%);
  color: #2b1a18;
  text-decoration: none;
  font-weight: bold;
  padding: 15px 25px;
  border-radius: 14px;
  transition: transform 0.2s, filter 0.2s;
  font-size: 1.1rem;
}

.big-btn:hover {
  transform: translateY(-3px);
  filter: brightness(1.1);
}
</style>
