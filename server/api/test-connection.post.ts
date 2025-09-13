export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { baseUrl, apiKey } = body

  if (!baseUrl || !apiKey) {
    return {
      error: {
        message: '缺少必要参数',
      },
    }
  }

  try {
    // 根据不同的API提供商使用不同的模型和格式
    let model = 'gpt-3.5-turbo'
    let requestBody: any = {
      model,
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message.',
        },
      ],
      max_tokens: 10,
    }

    // 如果是DeepSeek API，使用DeepSeek的模型
    if (baseUrl.includes('deepseek.com')) {
      model = 'deepseek-chat'
      requestBody = {
        model,
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.',
          },
        ],
        max_tokens: 10,
        stream: false,
      }
    }

    const response = await $fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    })

    return {
      data: {
        success: true,
        message: '连接测试成功',
        provider: baseUrl.includes('deepseek.com') ? 'DeepSeek' : 'OpenAI',
      },
    }
  } catch (error: any) {
    console.error('API测试失败:', error)

    // 提供更详细的错误信息
    let errorMessage = '连接测试失败'
    if (error.status === 400) {
      errorMessage = '请求格式错误，请检查API地址和Key'
    } else if (error.status === 401) {
      errorMessage = 'API Key无效或已过期'
    } else if (error.status === 403) {
      errorMessage = 'API Key权限不足'
    } else if (error.status === 404) {
      errorMessage = 'API地址不存在'
    } else if (error.status >= 500) {
      errorMessage = '服务器内部错误'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      error: {
        message: errorMessage,
        status: error.status,
      },
    }
  }
})
