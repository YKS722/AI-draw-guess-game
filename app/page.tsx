'use client';

import { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';

export default function Home() {
  const [guess, setGuess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleImageReady = async (imageData: string) => {
    setIsLoading(true);
    setError('');
    setGuess('');

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '请求失败');
      }

      const data = await response.json();
      setGuess(data.guess);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            你画我猜
          </h1>
          <p className="text-xl text-gray-600">
            在画布上画出你想画的，让 AI 来猜猜你画的是什么！
          </p>
        </header>

        <div className="flex flex-col items-center gap-8">
          <DrawingCanvas onImageReady={handleImageReady} />

          <div className="w-full max-w-2xl">
            {isLoading && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-blue-800 text-lg font-semibold">
                    AI 正在思考...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-6">
                <p className="text-red-800 text-lg">
                  <strong>错误:</strong> {error}
                </p>
              </div>
            )}

            {guess && !isLoading && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  AI 的猜测:
                </h2>
                <p className="text-green-900 text-lg leading-relaxed">
                  {guess}
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center mt-12 text-gray-500">
          <p>使用 Next.js 和 Gemini AI 构建</p>
        </footer>
      </div>
    </div>
  );
}
