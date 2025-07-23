export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig()

  if (!config.public.enableSignup) {
    return navigateTo('/')
  }
})
