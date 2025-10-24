'use client';

import { useState } from 'react';
import { Movie } from '@/types/movie';

interface MovieFormProps {
  onAddMovie: (movie: Omit<Movie, 'id' | 'addedAt'>) => void;
}

export default function MovieForm({ onAddMovie }: MovieFormProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [genre, setGenre] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !duration) {
      alert('タイトルと上映時間は必須です');
      return;
    }

    onAddMovie({
      title,
      duration: parseInt(duration),
      genre: genre || 'その他',
    });

    // フォームをリセット
    setTitle('');
    setDuration('');
    setGenre('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">映画を登録</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            映画タイトル *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="例: インセプション"
            required
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            上映時間（分）*
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="例: 148"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
            ジャンル
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">選択してください</option>
            <option value="アクション">アクション</option>
            <option value="コメディ">コメディ</option>
            <option value="ドラマ">ドラマ</option>
            <option value="SF">SF</option>
            <option value="ホラー">ホラー</option>
            <option value="アニメ">アニメ</option>
            <option value="ドキュメンタリー">ドキュメンタリー</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          映画を追加
        </button>
      </div>
    </form>
  );
}
