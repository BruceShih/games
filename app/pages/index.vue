<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

// definePageMeta({
//   middleware: 'guest'
// })

useHead({
  title: 'Games'
})

const { fetch } = useUserSession()
const { authenticate } = useWebAuthn()
const formSchema = toTypedSchema(z.object({
  email: z.email()
}))
const form = useForm({
  validationSchema: formSchema
})

const loading = ref(false)

const onLogin = form.handleSubmit(async (values) => {
  if (loading.value)
    return
  loading.value = true
  await authenticate(values.email)
    .then(fetch)
    .then(async () => await navigateTo('/games'))
    .catch(() => toast.error('Login failed'))
  loading.value = false
})
</script>

<!-- <template>
  <div class="flex justify-center">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          class="space-y-6"
          @submit.prevent="onLogin"
        >
          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autocomplete="username"
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button
            :disabled="loading"
            type="submit"
          >
            <Icon
              v-if="loading"
              class="animate-spin"
              name="lucide:rotate-cw"
            />
            <template v-if="loading">
              Logging in...
            </template>
            <template v-else>
              Login
            </template>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template> -->

<template>
  <div class="flex justify-center">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          class="space-y-6"
          @submit.prevent="onLogin"
        >
          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autocomplete="username"
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button
            :disabled="loading"
            type="submit"
          >
            <Icon
              v-if="loading"
              class="animate-spin"
              name="lucide:rotate-cw"
            />
            <template v-if="loading">
              Logging in...
            </template>
            <template v-else>
              Login
            </template>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
