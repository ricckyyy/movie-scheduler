'use client';

import { useState } from 'react';
import type { Theater } from '@/types/movie';

interface MovieData {
  id: string;
  title: string;
  theaters: {
    theater: Theater;
    showtimes: string[];
    duration: number;
  }[];
}

interface MovieManagerProps {
  movies: MovieData[];
  onAddMovie: (movie: MovieData) => void;
  onRemoveMovie: (movieId: string) => void;
}

export default function MovieManager({ movies, onAddMovie, onRemoveMovie }: MovieManagerProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900">登録済みの映画 ({movies.length}件)</h3>
      </div>

      {movies.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          まだ映画が登録されていません
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {movies.map((movie, index) => (
            <div key={movie.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">
                  映画{String.fromCharCode(65 + index)}: {movie.title}
                </h4>
                <button
                  onClick={() => onRemoveMovie(movie.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              </div>
              <p className="text-sm text-gray-600">上映時間: {movie.theaters[0].duration}分</p>
              <p className="text-sm text-gray-600">劇場数: {movie.theaters.length}館</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
