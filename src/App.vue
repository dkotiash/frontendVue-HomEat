<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo logo--bg"></div>
        <div class="brand-title">HomEat</div>
      </div>

      <nav class="nav">
        <RouterLink to="/">Home</RouterLink>

        <RouterLink to="/einkaufsliste">Einkaufsliste</RouterLink>

        <RouterLink to="/rezepte">Rezepte hinzufügen</RouterLink>

        <RouterLink to="/suche">Suche</RouterLink>
      </nav>

    </aside>

    <main class="glass">
      <RouterView />
    </main>
  </div>
</template>
