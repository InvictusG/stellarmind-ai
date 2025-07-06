import { NextRequest, NextResponse } from 'next/server';
import { MODEL_PRESETS } from '@/lib/models-presets';
import { LLMModel, ModelProvider } from '@/types';

// API提供商类型映射：前端APIProvider -> 后端ModelProvider
const PROVIDER_TYPE_MAPPING: Record<string, ModelProvider> = {
  'openai': 'OpenAI',
  'claude': 'Anthropic', 
  'gemini': 'Google',
  'zhipu': 'Qwen (Alibaba)', // 智谱映射到阿里巴巴Qwen
  'deepseek': 'DeepSeek',
  'custom': 'OpenAI' // 自定义默认映射到OpenAI
};

/**
 * 获取当前用户的活跃提供商
 * 优先使用前端传递的配置，回退到环境变量检查
 */
async function getActiveProvidersForCurrentUser(userProviders?: string[]): Promise<ModelProvider[]> {
  const providers: ModelProvider[] = [];
  
  // 如果前端传递了用户配置的提供商，优先使用
  if (userProviders && userProviders.length > 0) {
    console.log('使用前端配置的提供商:', userProviders);
    userProviders.forEach(provider => {
      const mappedProvider = PROVIDER_TYPE_MAPPING[provider.toLowerCase()];
      if (mappedProvider && !providers.includes(mappedProvider)) {
        providers.push(mappedProvider);
      }
    });
    
    if (providers.length > 0) {
      return providers;
    }
  }
  
  // 回退到环境变量检查
  const providerChecks: { provider: ModelProvider, key: string }[] = [
    { provider: 'DeepSeek', key: 'DEEPSEEK_API_KEY' },
    { provider: 'Anthropic', key: 'ANTHROPIC_API_KEY' },
    { provider: 'Google', key: 'GOOGLE_API_KEY' },
    { provider: 'OpenAI', key: 'OPENAI_API_KEY' },
    { provider: 'Llama (Meta)', key: 'META_API_KEY' },
    { provider: 'Grok (xAI)', key: 'GROK_API_KEY' },
    { provider: 'Qwen (Alibaba)', key: 'QWEN_API_KEY' },
    { provider: 'Mistral AI', key: 'MISTRAL_API_KEY' },
  ];

  providerChecks.forEach(check => {
    if (process.env[check.key]) {
      providers.push(check.provider);
    }
  });

  // 如果没有找到任何配置，默认显示OpenAI
  if (providers.length === 0) {
    console.warn("No API keys found in environment variables. Defaulting to show OpenAI models for demonstration.");
    providers.push('OpenAI');
  }
  
  return providers;
}

export async function GET(request: NextRequest) {
  try {
    // 从查询参数获取用户配置的提供商
    const searchParams = request.nextUrl.searchParams;
    const providersParam = searchParams.get('providers');
    const userProviders = providersParam ? providersParam.split(',') : undefined;
    
    console.log('API路由接收到的提供商参数:', userProviders);
    
    const activeProviders = await getActiveProvidersForCurrentUser(userProviders);
    console.log('最终使用的提供商:', activeProviders);

    let allAvailableModels: LLMModel[] = [];

    for (const provider of activeProviders) {
      const providerKey = provider as keyof typeof MODEL_PRESETS;
      if (MODEL_PRESETS[providerKey]) {
        const providerModels = MODEL_PRESETS[providerKey].map((model) => ({
          ...model,
          provider: providerKey,
          id: `${providerKey.toLowerCase().replace(/\s+/g, '-')}-${model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        }));
        allAvailableModels.push(...providerModels);
      }
    }
    
    console.log('返回的模型列表:', allAvailableModels.map(m => `${m.provider}-${m.name}`));
    
    return NextResponse.json(allAvailableModels);

  } catch (error) {
    console.error('Error fetching available models:', error);
    // Ensure we always return a valid JSON response even in case of error
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 