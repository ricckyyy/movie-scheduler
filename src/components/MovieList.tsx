'use client';

import { Movie } from '@/types/movie';
import { ScheduleGenerator } from '@/lib/scheduleGenerator';

interface MovieListProps {
  movies: Movie[];
  onDeleteMovie: (id: string) => void;
}

export default function MovieList({ movies, onDeleteMovie }: MovieListProps) {
  if (movies.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">登録済み映画</h2>
        <p className="text-gray-500 text-center py-8">
          まだ映画が登録されていません
        </p>
      </div>
    );
  }

  const totalDuration = movies.reduce((sum, movie) => sum + movie.duration, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">登録済み映画</h2>
        <span className="text-sm text-gray-600">
          合計: {movies.length}本 / {ScheduleGenerator.formatDuration(totalDuration)}
        </span>
      </div>
      
      <div className="space-y-3">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{movie.title}</h3>
              <div className="flex gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {movie.duration}分
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {movie.genre}
                </span>
              </div>
            </div>
            <button
              onClick={() => onDeleteMovie(movie.id)}
              className="ml-4 text-red-600 hover:text-red-800 transition-colors"
              title="削除"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
