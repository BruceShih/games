<script setup lang="ts">
import createGlobe from 'cobe'

const myLocation = useState('location')
const globe = ref<HTMLCanvasElement | null>(null)
const phi = ref(0)
const locations = ref<Array<{ latitude: number, longitude: number }>>([])

// Connect to the websocket endpoint
const { data, open } = useWebSocket(`/ws/visitors?latitude=${myLocation.value.latitude}&longitude=${myLocation.value.longitude}`, { immediate: false })
// When the data is received, we parse it as JSON and update the locations
watch(data, async (newData) => {
  locations.value = JSON.parse(typeof newData === 'string' ? newData : await newData.text())
})

// When the component is mounted, we connect to the websocket endpoint
// and create the globe
onMounted(() => {
  open()
  createGlobe(globe.value, {
    devicePixelRatio: 2,
    width: 400 * 2,
    height: 400 * 2,
    phi: 0,
    theta: 0,
    dark: 1,
    diffuse: 0.8,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [0.3, 0.3, 0.3],
    markerColor: [0.1, 0.8, 0.1],
    glowColor: [0.2, 0.2, 0.2],
    markers: [],
    opacity: 0.7,
    onRender(state) {
      // Get the locations from the data
      state.markers = locations.value.map(location => ({
        location: [location.latitude, location.longitude],
        // Set the size of the marker to 0.1 if it's the user's location, otherwise 0.05
        size: myLocation.value.latitude === location.latitude && myLocation.value.longitude === location.longitude ? 0.1 : 0.05
      }))
      // Rotate the globe
      state.phi = phi.value
      phi.value += 0.01
    }
  })
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <h1 class="text-4xl font-bold text-center">
      Games Hub
    </h1>

    <!-- Game Links -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      <NuxtLink
        class="block p-6 bg-muted/50 hover:bg-muted rounded-xl
               transition-all duration-300 hover:-translate-y-1
               border-2 border-transparent hover:border-primary/20"
        to="/games/minesweeper"
      >
        <div class="text-5xl text-center mb-4">
          💣
        </div>
        <h3 class="text-xl font-semibold text-center mb-2">
          Minesweeper
        </h3>
        <p class="text-sm text-muted-foreground text-center">
          Classic mine-hunting puzzle game
        </p>
      </NuxtLink>
    </div>

    <div class="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-10" />

    <h2 class="text-2xl font-bold text-center mb-4">
      Where's everyone at?
    </h2>
    <p class="text-center mb-6">
      <span class="text-lg font-semibold">{{ locations.length }}</span>
      {{ locations.length === 1 ? 'person' : 'people' }} connected.
    </p>
    <canvas
      ref="globe"
      class="w-full max-w-md h-auto aspect-square mx-auto"
    />
    <p class="text-center text-muted-foreground text-sm leading-relaxed">
      Powered by <a
        class="text-primary hover:underline"
        href="https://cobe.vercel.app/"
      >Cobe</a> and
      <a
        class="text-primary hover:underline"
        href="https://hub.nuxt.com/?utm_source=multiplayer-cobe"
      >NuxtHub</a>.<br>
      Inspired by
      <a
        class="text-primary hover:underline"
        href="https://github.com/cloudflare/templates/tree/main/multiplayer-globe-template"
      >
        Cloudflare's multiplayer-globe-template
      </a>.
    </p>
  </div>
</template>
