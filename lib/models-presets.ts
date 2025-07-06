import { ModelProvider } from '@/types';
import { LLMModel } from '@/types';

// Omit 'id' and 'provider' as they will be dynamically assigned
type ModelPreset = Omit<LLMModel, 'id' | 'provider'>;

export const MODEL_PRESETS: Record<ModelProvider, ModelPreset[]> = {
  'OpenAI': [
    { name: 'GPT-4.5 "Orion"', description: '为Pro用户发布，具备强大的思想链推理能力 (2025.02.27发布)' },
    { name: 'GPT-4.1', description: '为开发者优化，百万级上下文，知识截至2024年6月' },
    { name: 'GPT-4o', description: '原生多模态旗舰模型，优化了速度和成本' },
    { name: 'GPT-4o mini', description: 'GPT-4系列中最小、最快、最经济的模型，适合高通量任务' },
    { name: 'o4-mini', description: '新一代小型推理模型，精于数学、编码和视觉任务' },
    { name: 'o4-mini-high', description: 'o4-mini的高资源版本，在编码和视觉推理上更胜一筹' },
    { name: 'o3', description: '强大的推理模型，曾于2025.01.31发布，后被整合' },
  ],
  'Anthropic': [
    { name: 'Claude Opus 4', description: '下一代Opus模型，具备更强的推理能力' },
    { name: 'Claude Sonnet 4', description: '下一代Sonnet模型，平衡性能与速度' },
    { name: 'Claude 3.7 Sonnet', description: '具备深度上下文理解和安全对齐' },
    { name: 'Claude 3.5 Sonnet v2', description: 'Claude 3.5 Sonnet的增强版本' },
    { name: 'Claude 3.5 Haiku', description: '具备更高性价比的Haiku模型' },
    { name: 'Claude 3 Opus', description: '为复杂分析和前沿任务打造的最强模型' },
  ],
  'Google': [
    { name: 'Gemini 2.5 Pro', description: '增强的多模态理解与复杂问题解决' },
    { name: 'Gemini 2.5 Flash', description: '为高频、大规模任务优化的Flash版本' },
    { name: 'Gemini 2.5 Flash-Lite', description: '更轻量的Flash版本，追求极致速度' },
    { name: 'Gemini 2.0 Flash', description: '具备工具调用和百万级上下文的上一代模型' },
  ],
  'DeepSeek': [
    { name: 'DeepSeek-V3', description: '高效的671B参数混合专家（MoE）模型' },
    { name: 'DeepSeek V2.5', description: '专为编码和NLP设计的革命性模型' },
    { name: 'DeepSeek-R1-0528', description: 'Vertex AI上提供的特定推理优化版本 (2025.05.28)' },
  ],
  'Llama (Meta)': [
    { name: 'Llama 4 Maverick', description: 'Llama 4系列，性能卓越的旗舰模型' },
    { name: 'Llama 4 Scout', description: 'Llama 4系列，为特定任务优化的侦察模型' },
    { name: 'Llama 3.3', description: 'Llama 3系列的增强版本' },
    { name: 'Llama 3.1 405b', description: '4050亿参数的Llama 3.1版本' },
    { name: 'Llama 3.1 70b', description: '700亿参数的Llama 3.1版本' },
    { name: 'Llama 3.1 8b', description: '80亿参数的Llama 3.1版本' },
  ],
  'Grok (xAI)': [
    { name: 'Grok-3', description: '为多步"思想链"推理和实时网络搜索设计' },
  ],
  'Qwen (Alibaba)': [
    { name: 'Qwen 3', description: '混合专家模型，在多数基准测试中超越GPT-4o' },
    { name: 'Qwen 2.5', description: '支持文本、图像、音频和视频的多模态任务' },
  ],
  'Mistral AI': [
    { name: 'Codestral (25.01)', description: '专为代码生成和补全优化的模型' },
    { name: 'Mistral Small 3.1 (25.03)', description: '高效、低延迟的Small系列最新版' },
    { name: 'Mistral Large (24.11)', description: 'Mistral的上一代旗舰模型' },
    { name: 'Mistral Nemo', description: '专为特定应用场景设计的模型' },
    { name: 'Mistral OCR (25.05)', description: '具备强大光学字符识别能力的模型' },
  ]
}; 