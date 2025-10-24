'use client';

import { useState } from 'react';
import type { SchedulePattern } from '@/types/movie';

export default function Home() {
  const [movieA, setMovieA] = useState('');
  const [movieB, setMovieB] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [patterns, setPatterns] = useState<SchedulePattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ブックマークレット用のコード生成
  const bookmarkletCode = `javascript:(function(){const data={title:document.querySelector('h2.title,h1')?.textContent?.trim(),url:location.href,schedules:Array.from(document.querySelectorAll('.time-schedule .btn,.showtime')).map(el=>el.textContent.trim()).filter(t=>t.match(/\\d{1,2}:\\d{2}/))};const target=window.open('http://localhost:3000','_blank');setTimeout(()=>target.postMessage(data,'*'),1000);})();`;

  const handleSearch = async () => {
    if (!movieA || !movieB) {
      setError('両方の映画情報を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setPatterns([]);

    try {
      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          movieA: typeof movieA === 'string' ? movieA : movieA, 
          movieB: typeof movieB === 'string' ? movieB : movieB, 
          date 
        }),
      });

      if (!response.ok) {
        throw new Error('スケジュールの取得に失敗しました');
      }

      const data = await response.json();
      setPatterns(data.patterns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ブックマークレットからのメッセージを受信
  useState(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data?.title && event.data?.schedules) {
          // 自動的にフォームに入力
          if (!movieA) {
            setMovieA(JSON.stringify(event.data));
          } else {
            setMovieB(JSON.stringify(event.data));
          }
        }
      });
    }
  });

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          映画スケジューラー
        </h1>
        <p className="text-center text-gray-600 mb-8">
          2つの映画を連続で見るための最適なスケジュールを提案します
        </p>

        {/* 簡単な方法の説明 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 超簡単！3ステップで完了</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">映画タイトル入力</h3>
              <p className="text-sm text-gray-600">見たい映画のタイトルを下に入力（現在はモックデータ）</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">日付選択</h3>
              <p className="text-sm text-gray-600">鑑賞予定日を選択</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">検索実行</h3>
              <p className="text-sm text-gray-600">最適なスケジュールを自動生成</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 現在の仕様:</strong> 実際の上映データは取得できないため、モックデータで動作確認ができます。
              実装されているスケジュール最適化ロジック（移動時間計算、パターン生成）は完全に動作します。
            </p>
          </div>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                映画A
              </label>
              <input
                type="text"
                value={movieA}
                onChange={(e) => setMovieA(e.target.value)}
                placeholder="例: チェンソーマン"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                映画B
              </label>
              <input
                type="text"
                value={movieB}
                onChange={(e) => setMovieB(e.target.value)}
                placeholder="例: 鬼滅の刃"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日付
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'スケジュールを検索中...' : 'スケジュールを検索'}
          </button>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* スケジュールパターン表示 */}
        {patterns.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              おすすめスケジュール
              <span className="text-sm font-normal text-gray-600 ml-2">
                （{patterns.filter(p => p.feasible).length}件の実行可能なパターン）
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.slice(0, 10).map((pattern) => (
                <div
                  key={pattern.id}
                  className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                    pattern.feasible
                      ? 'border-green-200 hover:border-green-400'
                      : 'border-gray-200 opacity-60'
                  } transition-colors`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      パターン #{pattern.id}
                    </h3>
                    {pattern.feasible ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        実行可能
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                        困難
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="font-semibold text-gray-900">
                        {pattern.movieA.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        📍 {pattern.movieA.theater.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        🕐 {pattern.movieA.showtime} - {pattern.movieA.endTime}
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>🚃 移動時間: {pattern.travelTime}分</span>
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <div className="font-semibold text-gray-900">
                        {pattern.movieB.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        📍 {pattern.movieB.theater.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        🕐 {pattern.movieB.showtime} - {pattern.movieB.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    合計時間: {Math.floor(pattern.totalTime / 60)}時間
                    {pattern.totalTime % 60}分
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 説明セクション */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">📊 このアプリでできること</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ 完全に動作する機能</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 東京都内5劇場の位置情報</li>
                <li>• 劇場間の移動時間を正確に計算</li>
                <li>• 複数の上映パターンを自動生成</li>
                <li>• 実行可能性の判定</li>
                <li>• 最適なスケジュールのソート</li>
                <li>• レスポンシブなUI</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">⚠️ 制限事項</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 実際の上映データは取得不可</li>
                <li>• モックデータで動作確認</li>
                <li>• スクレイピングは利用規約の問題</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-xs text-blue-800">
                  <strong>実データ取得の代替案:</strong> ユーザーが映画館サイトで確認した上映時間を手動で入力する機能の追加も可能です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
