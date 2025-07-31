<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

// definePageMeta({
//   middleware: ['register']
// })

useHead({
  title: 'Register - Games'
})

const { fetch } = useUserSession()
const { register } = useWebAuthn()
const formSchema = toTypedSchema(z.object({
  email: z.email(),
  displayName: z.string().min(6).max(50)
}))
const form = useForm({
  validationSchema: formSchema
})

const loading = ref(false)

const onSignup = form.handleSubmit(async (values) => {
  if (loading.value)
    return
  loading.value = true

  await register({
    userName: values.email,
    displayName: values.displayName
  })
    .then(fetch)
    .then(async () => await navigateTo('/games'))
    .catch(_ => toast.error('Register failed'))

  loading.value = false
})
</script>

<template>
  <div class="flex justify-center">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="signup-form"
          class="space-y-6"
          @submit.prevent="onSignup"
        >
          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            v-slot="{ componentField }"
            name="displayName"
          >
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button
            id="signup-button"
            :disabled="loading"
            type="submit"
          >
            <Icon
              v-if="loading"
              class="animate-spin"
              name="lucide:rotate-cw"
            />
            <template v-if="loading">
              Registering...
            </template>
            <template v-else>
              Register
            </template>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
