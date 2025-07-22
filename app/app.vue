<script setup lang="ts">
const url = useRequestURL()

useSeoMeta({
  title: 'Multiplayer Globe with Nuxt',
  description: 'Display website visitor locations in real-time using Nuxt and NuxtHub.',
  ogImage: `${url.origin}/og-image.png`,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />
  <Head>
    <Link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css" />
  </Head>
  <div class="app">
    <a
      class="github-fork-ribbon"
      href="https://github.com/nuxt-hub/multiplayer-globe"
      data-ribbon="Fork me on GitHub"
      title="Fork me on GitHub"
    >Fork me on GitHub</a>
    <NuxtPage />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  background: black;
  color: white;
  font-family: 'Public Sans', sans-serif;
  text-align: center;
  padding-top: 40px;
  line-height: 1.5;
  font-size: 16px;
}

.github-fork-ribbon:before {
  background-color: #222 !important;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: white;
  font-weight: 600;
  line-height: 1.25;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

p {
  color: #888;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .app {
    padding: 1rem;
  }
}
</style>
