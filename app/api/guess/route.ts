import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: '没有提供图片数据' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 详细的 API 密钥检查日志
    console.log('环境变量检查:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) || 'undefined'
    });

    if (!apiKey) {
      // 错误信息保持通用性，以便适用于任何未配置的密钥
      return NextResponse.json(
        { error: 'API 密钥未配置' },
        { status: 500 }
      );
    }

    // 移除 base64 前缀 (此操作虽然多余，但保留，以防万一输入数据未标准化)
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');

    // *** 1. 更改为 OpenRouter 的模型名称和 API URL ***
    // OpenRouter 上的 Gemini Flash 模型名称
    const modelName = 'google/gemini-2.5-flash'; 
    // OpenRouter 的标准 Chat Completions API 端点
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'; 

    console.log('调用 OpenRouter API:', {
      model: modelName,
      imageDataLength: base64Image.length,
      url: apiUrl
    });

    // 图像描述的 prompt
    const prompt = '请仔细观察这张图片，描述你看到了什么。如果这是一幅画或涂鸦，请猜测画的是什么物体或场景。请用中文简洁地回答。(尽量缩短回答，最好不要超过10个字）';

    // *** 2. 更改请求体为 OpenRouter (OpenAI) Chat Completions 格式 ***
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // *** OpenRouter 要求在 Authorization 头部中传递 API 密钥 ***
        'Authorization': `Bearer ${apiKey}`, 
        'X-Title': 'My Next.js Gemini App' 
      },
      body: JSON.stringify({
        // OpenRouter 模型名称
        model: modelName, 
        // 使用 messages 数组格式
        messages: [
          {
            role: 'user',
            content: [
              // 文本部分
              {
                type: 'text',
                text: prompt,
              },
              // 图像部分 (注意 image_url 的格式，需要 base64 前缀)
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`, 
                },
              },
            ],
          },
        ],
        // 映射生成配置
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    console.log('OpenRouter API 响应状态:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API 错误详情:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      return NextResponse.json(
        {
          error: 'OpenRouter API 调用失败',
          details: errorData,
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('OpenRouter API 响应数据:', JSON.stringify(data, null, 2));

    // *** 3. 提取 AI 的回答 (OpenAI/OpenRouter 格式) ***
    const guess =
      data.choices?.[0]?.message?.content || '无法识别图片内容';

    return NextResponse.json({ guess });
  } catch (error) {
    console.error('处理请求时出错:', {
      error: error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}