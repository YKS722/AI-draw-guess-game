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
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API 密钥未配置' },
        { status: 500 }
      );
    }

    // 移除 base64 前缀
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');

    // 调用 Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: '请仔细观察这张图片，描述你看到了什么。如果这是一幅画或涂鸦，请猜测画的是什么物体或场景。请用中文简洁地回答。(尽量缩短回答，最好不要超过10个字）',
                },
                {
                  inline_data: {
                    mime_type: 'image/png',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API 错误:', errorData);
      return NextResponse.json(
        { error: 'Gemini API 调用失败', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 提取 AI 的回答
    const guess =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '无法识别图片内容';

    return NextResponse.json({ guess });
  } catch (error) {
    console.error('处理请求时出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: String(error) },
      { status: 500 }
    );
  }
}
