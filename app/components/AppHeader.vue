<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const headerLinks = useHeaderLinksStore()

const verticalLinks = reactive<DropdownMenuItem[]>(headerLinks.links.map((link) => {
  return {
    label: link.label,
    to: link.to
  }
}))
</script>

<template>
  <UContainer class="h-24 flex md:justify-between items-center sticky">
    <NuxtLink
      class="flex items-center flex-grow md:flex-grow-0 space-x-2"
      to="/"
    >
      <UAvatar
        alt="Bruce"
        size="lg"
      />
      <Icon name="lucide:gamepad-2" size="32" />
    </NuxtLink>
    <UNavigationMenu
      class="hidden md:flex md:justify-center"
      color="neutral"
      :items="headerLinks.links"
      variant="link"
    />
    <div class="flex">
      <UButton
        v-for="(link, index) in headerLinks.socialLinks"
        :key="index"
        color="neutral"
        :icon="link.icon"
        size="lg"
        target="_blank"
        :to="link.to"
        variant="link"
      />
    </div>

    <UDropdownMenu
      class="md:hidden"
      :items="verticalLinks"
    >
      <UButton
        color="neutral"
        icon="lucide:menu"
        size="lg"
        variant="link"
      />
    </UDropdownMenu>
  </UContainer>
</template>
