'use client';

import { useState } from 'react';
import { Movie, DailySchedule } from '@/types/movie';
import { ScheduleGenerator } from '@/lib/scheduleGenerator';
import MovieForm from '@/components/MovieForm';
import MovieList from '@/components/MovieList';
import ScheduleView from '@/components/ScheduleView';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);

  const handleAddMovie = (movieData: Omit<Movie, 'id' | 'addedAt'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: Date.now().toString(),
      addedAt: new Date(),
    };
    setMovies([...movies, newMovie]);
  };

  const handleDeleteMovie = (id: string) => {
    setMovies(movies.filter(movie => movie.id !== id));
    // 映画を削除したらスケジュールも再生成
    if (schedule) {
      const updatedMovies = movies.filter(movie => movie.id !== id);
      if (updatedMovies.length > 0) {
        setSchedule(ScheduleGenerator.generateDailySchedule(updatedMovies));
      } else {
        setSchedule(null);
      }
    }
  };

  const handleGenerateSchedule = () => {
    if (movies.length === 0) {
      alert('まず映画を登録してください');
      return;
    }
    const newSchedule = ScheduleGenerator.generateDailySchedule(movies);
    setSchedule(newSchedule);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-4xl">🎬</span>
            映画スケジューラー
          </h1>
          <p className="text-gray-600 mt-2">見たい映画を登録して、1日の視聴スケジュールを自動生成</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 映画登録フォーム */}
          <MovieForm onAddMovie={handleAddMovie} />

          {/* 登録済み映画リスト */}
          <MovieList movies={movies} onDeleteMovie={handleDeleteMovie} />
        </div>

        {/* スケジュール生成ボタン */}
        {movies.length > 0 && (
          <div className="mb-6 text-center">
            <button
              onClick={handleGenerateSchedule}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📅 スケジュールを生成する
            </button>
          </div>
        )}

        {/* スケジュール表示 */}
        <ScheduleView schedule={schedule} />
      </main>

      {/* フッター */}
      <footer className="bg-white mt-12 py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Movie Scheduler. 1日で映画を効率的に楽しもう！</p>
        </div>
      </footer>
    </div>
  );
}
