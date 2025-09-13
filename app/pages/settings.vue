<script setup lang="ts">
definePageMeta({
  layout: 'app-main',
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)
const isModalOpen = ref(false)
const configFromServer = ref()

// 配置类型定义
interface ConfigData {
  id?: string
  user_id?: string
  baseUrl?: string
  apiKey?: string
  created_at?: string
}

// 表单数据
const form = ref({
  baseUrl: '',
  apiKey: '',
})

// 表单验证规则
const rules = ref({
  baseUrl: [{ required: true, message: '请输入AI模型地址', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入API Key', trigger: 'blur' }],
})

// 获取配置数据
const { data: config } = await useAsyncData<ConfigData>(
  'config',
  async () => {
    const { data } = await client
      .from('config')
      .select('*')
      .eq('user_id', user.value!.id)
      .single()

    return (data as unknown as ConfigData) ?? ({} as ConfigData)
  },
  { default: () => ({}) as ConfigData },
)

// 监听配置变化，自动更新表单
watch(
  config,
  (newConfig) => {
    if (newConfig && Object.keys(newConfig).length > 0) {
      form.value = {
        baseUrl: newConfig.baseUrl || '',
        apiKey: newConfig.apiKey || '',
      }
    }
  },
  { immediate: true },
)

// 保存配置
const saveConfig = async () => {
  if (!form.value.baseUrl.trim() || !form.value.apiKey.trim()) {
    ElMessage.error('请填写所有必填字段')
    return
  }

  loading.value = true

  const { data, error } = await client
    .from('config')
    .upsert(
      {
        user_id: user.value!.id,
        baseUrl: form.value.baseUrl,
        apiKey: form.value.apiKey,
      } as any,
      {
        onConflict: 'user_id',
      },
    )
    .select('*')
    .single()

  if (error) {
    ElMessage.error(`保存失败: ${error.message}`)
  } else {
    ElMessage.success('配置已成功保存')
    config.value = data
  }

  loading.value = false
}

// 重置表单
const resetForm = () => {
  form.value = {
    baseUrl: config.value?.baseUrl || '',
    apiKey: config.value?.apiKey || '',
  }
}

// 从服务器路由获取配置
const fetchConfigFromServerRoute = async () => {
  try {
    const response = await $fetch('/api/config', {
      headers: useRequestHeaders(['cookie']),
    })

    configFromServer.value = response
    isModalOpen.value = true
  } catch (error) {
    ElMessage.error('获取服务器配置失败')
    console.error('获取配置失败:', error)
  }
}

// 测试连接
const testConnection = async () => {
  if (!form.value.baseUrl.trim() || !form.value.apiKey.trim()) {
    ElMessage.error('请先填写API地址和Key')
    return
  }

  loading.value = true

  try {
    const response = (await $fetch('/api/test-connection', {
      method: 'POST',
      body: {
        baseUrl: form.value.baseUrl,
        apiKey: form.value.apiKey,
      },
    })) as { data?: any; error?: { message: string } }

    if (response.error) {
      ElMessage.error(`连接测试失败: ${response.error.message}`)
    } else {
      ElMessage.success('API连接正常')
    }
  } catch (err: any) {
    ElMessage.error(`连接测试失败: ${err.message || '网络错误'}`)
  }

  loading.value = false
}
</script>

<template>
  <el-card>
    <template #header>
      <span>AI 配置设置</span>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="AI 模型地址" prop="baseUrl" required>
        <el-input
          v-model="form.baseUrl"
          placeholder="https://api.openai.com/v1"
          :loading="loading"
          clearable
        />
      </el-form-item>

      <el-form-item label="API Key" prop="apiKey" required>
        <ClientOnly>
          <el-input
            v-model="form.apiKey"
            type="password"
            placeholder="请输入您的API Key"
            :loading="loading"
            show-password
            clearable
          />
          <template #fallback>
            <el-input
              v-model="form.apiKey"
              type="password"
              placeholder="请输入您的API Key"
              :loading="loading"
              clearable
            />
          </template>
        </ClientOnly>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="saveConfig">
          保存配置
        </el-button>
        <el-button :disabled="loading" @click="resetForm"> 重置 </el-button>
        <el-button type="success" :loading="loading" @click="testConnection">
          测试连接
        </el-button>
        <el-button type="info" @click="fetchConfigFromServerRoute">
          从服务器获取配置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 服务器配置对话框 -->
    <el-dialog v-model="isModalOpen" title="服务器配置数据" width="60%">
      <pre>{{
        configFromServer
          ? JSON.stringify(configFromServer, null, 2)
          : '暂无数据'
      }}</pre>
      <template #footer>
        <el-button @click="isModalOpen = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
