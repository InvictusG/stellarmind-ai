import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

// 确保已在环境变量中设置了您的API密钥
// For local development, you can use a .env.local file
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // 如果您使用自定义的或代理的OpenAI端点，请取消注释下一行
  // baseURL: process.env.OPENAI_API_BASE,
}) : null;

export const runtime = 'edge';

const STELLARMIND_PROMPT_TEMPLATE = `
你是StellarMind AI，一个基于第一性原理思维的AI知识探索专家。你的任务是层层分解问题，追根溯源，直到找到问题的根本原理。

**核心原则**:
- 第一性原理思维：将复杂问题分解为基本构成要素
- 逐层深入：从现象 → 机制 → 原理 → 本质
- 阅读层级适配：根据{{readingLevel}}调整回答复杂度
- 公式支持：涉及数学/物理概念时使用LaTeX格式

**当前任务**:
- 层级: {{level}}
- 阅读层级: {{readingLevel}}
- 父节点内容: "{{question}}"
- 父节点ID: "{{parentId}}"

**阅读层级说明**:
- 幼儿园🧸: 用最简单的比喻和日常例子解释，避免专业术语
- 小学📚: 用基础概念和简单例子，可以有少量专业词汇
- 中学🎓: 包含基础公式和科学概念，逻辑清晰
- 高中📖: 涉及较复杂的公式和理论，需要一定知识基础
- 大学🎓: 使用专业术语和复杂公式，深入理论分析
- 博士👨‍🎓: 最高学术水平，前沿研究和高级数学表达

**生成规则**:
{{levelInstructions}}

**LaTeX公式格式**: 使用 $...$ 包围行内公式，$$...$$ 包围独立公式

**输出格式**: 只输出JSON，每行一个节点，格式如下：
{"type":"node","data":{"content":"节点内容","level":{{level}},"nodeType":"{{expectedType}}","parentId":"{{parentId}}"}}

**示例输出**:
{{examples}}

请严格按照格式输出，不要添加任何解释文字：
`;

// 模拟节点生成函数
function generateMockNodes(level: number, expectedType: string, parentId: string): string {
  const mockData: { [key: string]: string[] } = {
    'question-1': [
      '{"type":"node","data":{"content":"什么是基本原理？","level":1,"nodeType":"question","parentId":"' + parentId + '"}}',
      '{"type":"node","data":{"content":"有哪些应用场景？","level":1,"nodeType":"question","parentId":"' + parentId + '"}}',
      '{"type":"node","data":{"content":"发展历程如何？","level":1,"nodeType":"question","parentId":"' + parentId + '"}}',
      '{"type":"node","data":{"content":"面临什么挑战？","level":1,"nodeType":"question","parentId":"' + parentId + '"}}'
    ],
    'answer-2': [
      '{"type":"node","data":{"content":"基于深度学习和神经网络技术","level":2,"nodeType":"answer","parentId":"' + parentId + '"}}'
    ],
    'question-3': [
      '{"type":"node","data":{"content":"具体实现机制是什么？","level":3,"nodeType":"question","parentId":"' + parentId + '"}}'
    ],
    'answer-4': [
      '{"type":"node","data":{"content":"通过多层神经网络处理复杂数据","level":4,"nodeType":"answer","parentId":"' + parentId + '"}}'
    ]
  };

  const key = `${expectedType}-${level}`;
  const nodes = mockData[key] || mockData['question-1'];
  return nodes.join('\n');
}

async function recursiveExplore(
  question: string,
  parentId: string,
  level: number,
  controller: ReadableStreamDefaultController<any>,
  encoder: TextEncoder,
  modelId: string,
  readingLevel: string = '大学🎓',
  maxDepth: number = 4
) {
  if (level > maxDepth) {
    return;
  }

  // 根据层级确定生成的节点类型和指令
  let levelInstructions = '';
  let expectedType = '';
  let examples = '';
  
  if (level === 1) {
    expectedType = 'question';
    levelInstructions = `
按照第一性原理思维，将主题分解为3-4个核心子问题：
1. 定义与本质：这个概念的基本定义是什么？
2. 原理与机制：底层工作原理是什么？
3. 应用与影响：实际应用场景和影响是什么？
4. 局限与发展：面临的挑战和发展方向是什么？

每个问题要能够引导向更深层的探索，避免表面化的描述。
    `;
    examples = '{"type":"node","data":{"content":"人工智能的本质定义是什么？","level":1,"nodeType":"question","parentId":"' + parentId + '"}}\n{"type":"node","data":{"content":"AI系统的核心工作原理是什么？","level":1,"nodeType":"question","parentId":"' + parentId + '"}}';
  } else if (level === 2) {
    expectedType = 'answer';
    levelInstructions = `
基于上级问题，提供深入的分析性答案：
- 不只是给出"是什么"，要解释"为什么"
- 根据阅读层级调整复杂度，包含适当的专业术语
- 如果涉及数学/物理概念，使用LaTeX公式
- 每个答案要为下一层的深入探索埋下伏笔
- 答案长度控制在50-100字，确保信息密度
    `;
    examples = '{"type":"node","data":{"content":"AI本质是通过算法模拟人类认知过程，核心在于模式识别和决策优化，数学基础是概率论和线性代数，如神经网络的激活函数 $f(x) = \\\\frac{1}{1+e^{-x}}$","level":2,"nodeType":"answer","parentId":"' + parentId + '"}}';
  } else if (level === 3) {
    expectedType = 'question';
    levelInstructions = `
基于上级答案，生成1-2个更深层的探索问题：
- 追问"为什么会这样"或"如何实现的"
- 探索答案中提到的关键概念或机制
- 向更基础的原理层面深入
- 确保问题具有探索价值，能引导到根本原理
    `;
    examples = '{"type":"node","data":{"content":"为什么Sigmoid函数能够实现非线性映射？","level":3,"nodeType":"question","parentId":"' + parentId + '"}}';
  } else {
    expectedType = 'answer';
    levelInstructions = `
提供最深层的原理性解释：
- 回到数学、物理或逻辑的基本原理
- 解释现象背后的根本机制
- 使用公式和理论模型（如果适用）
- 连接到更广泛的理论框架
- 体现第一性原理思维的终极目标
    `;
    examples = '{"type":"node","data":{"content":"Sigmoid函数的S形曲线源于指数函数的性质，当 $x \\\\rightarrow -\\\\infty$ 时 $e^{-x} \\\\rightarrow \\\\infty$，使得 $\\\\sigma(x) \\\\rightarrow 0$；当 $x \\\\rightarrow +\\\\infty$ 时 $e^{-x} \\\\rightarrow 0$，使得 $\\\\sigma(x) \\\\rightarrow 1$，这种单调性和有界性正是神经网络需要的非线性激活特性","level":4,"nodeType":"answer","parentId":"' + parentId + '"}}';
  }

  const prompt = STELLARMIND_PROMPT_TEMPLATE
    .replace('{{question}}', question)
    .replace('{{parentId}}', parentId)
    .replace('{{level}}', String(level))
    .replace('{{readingLevel}}', readingLevel)
    .replace('{{levelInstructions}}', levelInstructions)
    .replace('{{expectedType}}', expectedType)
    .replace('{{examples}}', examples);

  try {
    let content = '';
    
    if (openai) {
      // 使用真实的OpenAI API
      const response = await openai.chat.completions.create({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1500,
      });
      content = response.choices[0].message?.content || '';
    } else {
      // 模拟模式 - 生成示例节点
      console.log('使用模拟模式生成节点');
      content = generateMockNodes(level, expectedType, parentId);
    }
    
    if (!content) return;

    const lines = content.split('\n').filter(line => line.trim().startsWith('{'));
    const childNodes = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line.trim());
        if (parsed.type === 'node') {
          const newNodeId = `${parsed.data.nodeType}-${uuidv4()}`;
          const nodeWithId = {
            ...parsed,
            data: { ...parsed.data, id: newNodeId }
          };
          
          // Stream Node
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(nodeWithId)}\n\n`));
          
          // Stream Edge
          const edge = { type: 'edge', data: { source: parentId, target: newNodeId } };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(edge)}\n\n`));

          childNodes.push(nodeWithId.data);
        }
      } catch (e) {
        console.warn('Failed to parse line from LLM, skipping:', line);
      }
    }
    
    // 修复递归调用逻辑 - 确保正确递归
    for (const childNode of childNodes) {
      // 对于level 1的问题节点，生成答案节点
      if (level === 1 && childNode.nodeType === 'question') {
        // 为问题节点生成答案
        await recursiveExplore(
          `请回答：${childNode.content}`, 
          childNode.id, 
          level + 1, 
          controller, 
          encoder, 
          modelId,
          readingLevel
        );
      }
      // 对于level 2的答案节点，生成深化问题
      else if (level === 2 && childNode.nodeType === 'answer') {
        // 为答案节点生成深化问题
        await recursiveExplore(
          `基于这个答案"${childNode.content}"，可以进一步探索什么？`, 
          childNode.id, 
          level + 1, 
          controller, 
          encoder, 
          modelId,
          readingLevel
        );
      }
      // 对于level 3的问题节点，生成最终答案
      else if (level === 3 && childNode.nodeType === 'question') {
        await recursiveExplore(
          `请回答：${childNode.content}`, 
          childNode.id, 
          level + 1, 
          controller, 
          encoder, 
          modelId,
          readingLevel
        );
      }
    }

  } catch (error) {
    console.error('Error during OpenAI API call:', error);
    const errorEvent = { type: 'error', data: { message: 'Failed to call AI service.' } };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
  }
}

export async function POST(req: NextRequest) {
  const { question, modelId, readingLevel } = await req.json();

  if (!question) {
    return new Response('Missing question in request body', { status: 400 });
  }
  
  console.log("Using model ID from request:", modelId); // Log the received model ID

  // Fallback to a default model if modelId is not provided
  const effectiveModelId = modelId || 'gpt-4o';
  console.log(`Executing exploration with model: ${effectiveModelId}`);

  // 使用OpenAI直接调用，不需要LangChain
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. 创建并发送根节点
        const rootId = `question-${uuidv4()}`;
        const rootNode = {
          type: 'node',
          data: {
            id: rootId,
            content: question,
            level: 0,
            nodeType: 'question',
            parentId: null,
          },
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(rootNode)}\n\n`));

        // 2. 开始递归探索
        await recursiveExplore(question, rootId, 1, controller, encoder, effectiveModelId, readingLevel || '大学🎓');
        
        // 3. 发送结束信号
        const doneEvent = { type: 'done', data: { message: 'Exploration complete.' } };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`));

        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const question = searchParams.get('question');
  const modelId = searchParams.get('modelId');

  if (!question) {
    return NextResponse.json({ error: 'Missing question parameter' }, { status: 400 });
  }

  console.log("GET request - Using model ID:", modelId);

  // Fallback to a default model if modelId is not provided
  const effectiveModelId = modelId || 'gpt-4o';
  console.log(`GET request - Executing exploration with model: ${effectiveModelId}`);

  // For GET requests, we'll return a simple JSON response instead of streaming
  // This is useful for testing or simple integrations
  return NextResponse.json({
    message: 'Exploration endpoint is available',
    question,
    modelId: effectiveModelId,
    timestamp: new Date().toISOString(),
  });
}

export async function DELETE(req: NextRequest) {
  // This endpoint could be used to cancel ongoing explorations
  // For now, we'll just return a success response
  return NextResponse.json({
    message: 'Exploration cancelled',
    timestamp: new Date().toISOString(),
  });
} 