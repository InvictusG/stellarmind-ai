'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { LLMModel, ModelProvider } from '@/types';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { getAPIKeys } from '@/utils/apiKeyManager';

// Helper to group models by provider
const groupModelsByProvider = (models: LLMModel[]): Record<string, LLMModel[]> => {
  return models.reduce((acc, model) => {
    (acc[model.provider] = acc[model.provider] || []).push(model);
    return acc;
  }, {} as Record<string, LLMModel[]>);
};

export function ModelSelector() {
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const { selectedModel, setSelectedModel } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by ensuring component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // 获取用户配置的API密钥，确定可用的提供商
        const userAPIKeys = getAPIKeys();
        const userProviders = userAPIKeys.map(config => config.provider);
        
        console.log('用户配置的提供商:', userProviders);
        
        // 构建查询参数，传递用户配置的提供商
        const queryParams = userProviders.length > 0 
          ? `?providers=${userProviders.join(',')}` 
          : '';
        
        const response = await fetch(`/api/models/available${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const models: LLMModel[] = await response.json();
        console.log('获取到的模型列表:', models);
        
        setAvailableModels(models);
        // If no model is selected, or selected model is not in the new list, set a default
        if (!selectedModel || !models.some(m => m.id === selectedModel.id)) {
          setSelectedModel(models[0] || null);
        }
      } catch (error) {
        console.error("Error fetching available models:", error);
        // Fallback to a default model if API fails
        const fallbackModel = { id: 'openai-gpt-4o', provider: 'OpenAI' as ModelProvider, name: 'GPT-4o', description: '旗舰模型' };
        setAvailableModels([fallbackModel]);
        setSelectedModel(fallbackModel);
      }
    };

    if (mounted) {
      fetchModels();
    }
    
    // 监听API配置更新事件
    const handleConfigUpdate = () => {
      console.log('检测到API配置更新，重新获取模型列表');
      if (mounted) {
        fetchModels();
      }
    };
    
    if (mounted) {
      window.addEventListener('apiConfigUpdated', handleConfigUpdate);
    }
    
    return () => {
      if (mounted) {
        window.removeEventListener('apiConfigUpdated', handleConfigUpdate);
      }
    };
  }, [mounted, selectedModel, setSelectedModel]);

  const groupedModels = useMemo(() => groupModelsByProvider(availableModels), [availableModels]);
  const providers = useMemo(() => Object.keys(groupedModels), [groupedModels]);

  // Show consistent content before hydration is complete
  if (!mounted) {
    return (
      <Button
        variant="outline"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
          "bg-black/30 border-zinc-700/80 backdrop-blur-sm",
          "hover:bg-black/50 hover:border-zinc-600",
          "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
        )}
      >
        <span className="text-sm font-medium text-zinc-300">StellarMind</span>
        <span className="text-sm font-semibold text-white">选择模型</span>
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </Button>
    );
  }

  const currentModelName = selectedModel?.name || "选择模型";
  const currentProviderName = selectedModel?.provider || "StellarMind";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
            "bg-black/30 border-zinc-700/80 backdrop-blur-sm",
            "hover:bg-black/50 hover:border-zinc-600",
            "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
          )}
        >
          <span className="text-sm font-medium text-zinc-300">{currentProviderName}</span>
          <span className="text-sm font-semibold text-white">{currentModelName}</span>
          <ChevronDown className={cn(
            "h-4 w-4 text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-80 bg-black/80 backdrop-blur-lg border-zinc-800 text-zinc-200"
      >
        {providers.map((provider, index) => (
          <DropdownMenuGroup key={provider}>
            <DropdownMenuLabel className="text-zinc-400 font-semibold px-2 py-1.5">{provider}</DropdownMenuLabel>
            {groupedModels[provider].map((model) => (
              <DropdownMenuItem
                key={model.id}
                onSelect={() => setSelectedModel(model)}
                className="cursor-pointer focus:bg-purple-800/40 focus:text-white"
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{model.name}</span>
                    {selectedModel?.id === model.id && (
                      <Check className="h-4 w-4 text-purple-400" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{model.description}</p>
                </div>
              </DropdownMenuItem>
            ))}
            {index < providers.length - 1 && <DropdownMenuSeparator className="bg-zinc-800" />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 