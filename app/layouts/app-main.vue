<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="flex h-full">
    <div
      class="flex flex-col justify-between border-r border-[#DADADA] bg-[#EDEDED] px-2 py-4 dark:border-[#292929] dark:bg-[#121212]"
    >
      <div class="flex flex-col items-center gap-4 text-xl">
        <img src="/img/logo.png" alt="logo" class="h-[44px] w-[44px]" />

        <RouterLink
          to="/"
          :class="{ 'text-[#3498db]': $route.path === '/' }"
          class="icon-btn i-carbon-home"
        ></RouterLink>
      </div>

      <div class="flex flex-col items-center gap-4 text-xl">
        <a
          class="i-carbon-logo-github icon-btn"
          href="https://github.com/tlyboy/ai-studio"
          target="_blank"
          rel="noopener noreferrer"
        ></a>

        <DarkToggle />

        <RouterLink
          to="/settings"
          :class="{ 'text-[#3498db]': $route.path === '/settings' }"
          class="icon-btn i-carbon-settings"
        ></RouterLink>

        <button
          v-if="user"
          class="icon-btn i-carbon-logout"
          @click="logout"
        ></button>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
