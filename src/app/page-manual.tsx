'use client';

import { useState } from 'react';
import ManualInputForm from '@/components/ManualInputForm';
import type { SchedulePattern, MovieTheaterSchedule, Theater } from '@/types/movie';

export default function Home() {
  const [movieAData, setMovieAData] = useState<any>(null);
  const [movieBData, setMovieBData] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [patterns, setPatterns] = useState<SchedulePattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const convertToSchedules = (data: any): MovieTheaterSchedule[] => {
    return data.theaters.map((t: any) => ({
      movie: {
        title: data.title,
        duration: t.duration,
      },
      theater: t.theater,
      showtimes: t.showtimes.map((time: string) => ({
        time,
        available: true,
      })),
      date,
    }));
  };

  const handleSearch = async () => {
    if (!movieAData || !movieBData) {
      setError('両方の映画を登録してください');
      return;
    }

    setLoading(true);
    setError('');
    setPatterns([]);

    try {
      const schedulesA = convertToSchedules(movieAData);
      const schedulesB = convertToSchedules(movieBData);

      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedulesA,
          schedulesB,
          date,
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

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-900">
          🎬 映画スケジューラー
        </h1>
        <p className="text-center text-gray-600 mb-8">
          2つの映画を連続で見るための最適なスケジュールを提案します
        </p>

        {/* 説明 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">✨ 新機能：手動入力 + 実際の移動時間</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">✅ 動作する機能</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• 上映時間を手動で入力</li>
                <li>• Google Maps APIで実際の移動時間を計算</li>
                <li>• 複数劇場・複数上映時間に対応</li>
                <li>• 最適なスケジュールパターンを自動生成</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800">
                <strong>💡 使い方:</strong> TOHOシネマズの公式サイトで映画の上映時間を確認し、
                下のフォームに入力してください。移動時間はGoogle Maps APIで自動計算されます！
              </p>
            </div>
          </div>
        </div>

        {/* 映画入力フォーム */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ManualInputForm
            movieLabel="映画A"
            onSubmit={(data) => {
              setMovieAData(data);
              setError('');
            }}
          />
          <ManualInputForm
            movieLabel="映画B"
            onSubmit={(data) => {
              setMovieBData(data);
              setError('');
            }}
          />
        </div>

        {/* 登録済み情報表示 */}
        {(movieAData || movieBData) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">登録済みの映画</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {movieAData && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">映画A: {movieAData.title}</h4>
                    <button
                      onClick={() => setMovieAData(null)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      削除
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">上映時間: {movieAData.theaters[0].duration}分</p>
                  <p className="text-sm text-gray-600">劇場数: {movieAData.theaters.length}館</p>
                </div>
              )}
              {movieBData && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">映画B: {movieBData.title}</h4>
                    <button
                      onClick={() => setMovieBData(null)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      削除
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">上映時間: {movieBData.theaters[0].duration}分</p>
                  <p className="text-sm text-gray-600">劇場数: {movieBData.theaters.length}館</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 日付選択と検索ボタン */}
        {movieAData && movieBData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  鑑賞予定日
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '計算中...' : '最適スケジュールを検索'}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* スケジュールパターン表示 */}
        {patterns.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                おすすめスケジュール
              </h2>
              <span className="text-sm text-gray-600">
                {patterns.filter(p => p.feasible).length}件の実行可能なパターン
              </span>
            </div>
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
                      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full">
                        <span>🚃 移動時間: <strong>{pattern.travelTime}分</strong></span>
                        <span className="text-xs">(Google Maps)</span>
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
      </div>
    </main>
  );
}
