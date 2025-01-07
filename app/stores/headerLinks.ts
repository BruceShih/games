import type { NavigationMenuItem } from "@nuxt/ui"

interface HeaderLinksState {
  links: NavigationMenuItem[]
  socialLinks: NavigationMenuItem[]
}

export const useHeaderLinksStore = defineStore('headerLinksStore', {
  state: (): HeaderLinksState => {
    return {
      links: [
        {
          label: 'Minesweeper',
          to: '/minesweeper'
        }
      ],
      socialLinks: [
        {
          label: 'Twitter',
          icon: 'lucide:twitter',
          to: `https://twitter.com/bruceshihtw`
        },
        {
          label: 'GitHub',
          icon: 'lucide:github',
          to: `https://github.com/BruceShih`
        }
      ]
    }
  }
})
