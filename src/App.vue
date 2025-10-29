<script setup lang="ts">
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>

/* Lifecycle hooks
onMounted(async() => {
let userClaims | undefined = undefined
try {

інше

async function loadThings(owner: string = ''){
const baseUrl = import.meta.env.Vite_BACKEND_BASE_URL // http://localhost:8080 in dev mode
const endpoinnt = baseUrl + '/things' + '?owner=' + owner
const response : AxiosResponse = await.axios.get(endpoint)
