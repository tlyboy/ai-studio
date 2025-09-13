<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4">
    <slot />

    <div class="flex items-center gap-2 text-xl">
      <a
        class="i-carbon-logo-github icon-btn"
        href="https://github.com/tlyboy/ai-studio"
        target="_blank"
        rel="noopener noreferrer"
      ></a>

      <DarkToggle />

      <button
        v-if="user"
        class="icon-btn i-carbon-logout"
        @click="logout"
      ></button>
    </div>
  </div>
</template>
