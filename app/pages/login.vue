<script setup lang="ts">
const supabase = useSupabaseClient()
const form = ref({
  email: '',
})

const rules = ref({
  email: [{ required: true, message: '请输入电子邮件', trigger: 'blur' }],
})
const loginRef = useTemplateRef('loginRef')

const signInWithGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'http://localhost:3000/confirm',
    },
  })
  if (error) console.log(error)
}

const signInWithOtp = async () => {
  await loginRef.value?.validate()
  const { error } = await supabase.auth.signInWithOtp({
    email: form.value.email,
    options: {
      emailRedirectTo: 'http://localhost:3000/confirm',
    },
  })
  if (error) console.log(error)
}
</script>
<template>
  <div class="min-w-sm rounded-lg bg-white p-4 dark:bg-[var(--el-bg-color)]">
    <div class="mb-4 flex justify-center">
      <img src="/img/logo.png" alt="logo" class="h-10 w-10" />
    </div>

    <div class="mb-4 text-center">登录/注册</div>

    <el-button
      class="flex w-full items-center justify-center"
      plain
      @click="signInWithGitHub"
    >
      <el-icon><span class="i-carbon-logo-github"></span></el-icon>
      <span>GitHub</span>
    </el-button>

    <el-divider>或者</el-divider>

    <el-form
      :model="form"
      :rules="rules"
      ref="loginRef"
      label-width="auto"
      label-position="top"
    >
      <el-form-item label="电子邮件" prop="email">
        <el-input
          v-model="form.email"
          type="email"
          placeholder="请输入电子邮件"
        />
      </el-form-item>
      <el-form-item>
        <el-button class="w-full" type="primary" @click="signInWithOtp"
          >继续</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
