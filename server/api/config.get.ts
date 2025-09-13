import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '未授权',
    })
  }

  try {
    const { data, error } = await client
      .from('config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    return {
      data: data || {},
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取配置失败',
    })
  }
})
