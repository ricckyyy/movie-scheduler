'use client';

import { useState } from 'react';
import { TOHO_THEATERS } from '@/lib/theaters';
import type { Theater, Showtime } from '@/types/movie';

interface ManualInputFormProps {
  onSubmit: (data: {
    title: string;
    theaters: {
      theater: Theater;
      showtimes: string[];
      duration: number;
    }[];
  }) => void;
  movieLabel: string;
  customTheaters?: Theater[];
}

export default function ManualInputForm({ onSubmit, movieLabel, customTheaters = [] }: ManualInputFormProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(120);
  const [selectedTheaters, setSelectedTheaters] = useState<Set<string>>(new Set());
  const [showtimes, setShowtimes] = useState<Map<string, string[]>>(new Map());

  // TOHOシネマズ + カスタム映画館
  const allTheaters = [...TOHO_THEATERS, ...customTheaters];

  // 9:00-22:00の30分刻みの時間帯を生成
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 22 && minute === 30) break; // 22:00で終了
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const toggleTheater = (theaterId: string) => {
    const newSelected = new Set(selectedTheaters);
    if (newSelected.has(theaterId)) {
      newSelected.delete(theaterId);
      const newShowtimes = new Map(showtimes);
      newShowtimes.delete(theaterId);
      setShowtimes(newShowtimes);
    } else {
      newSelected.add(theaterId);
    }
    setSelectedTheaters(newSelected);
  };

  const toggleShowtime = (theaterId: string, time: string) => {
    const newShowtimes = new Map(showtimes);
    const times = newShowtimes.get(theaterId) || [];
    
    if (times.includes(time)) {
      // 既に選択されている場合は削除
      newShowtimes.set(
        theaterId,
        times.filter(t => t !== time)
      );
    } else {
      // 選択されていない場合は追加
      times.push(time);
      times.sort();
      newShowtimes.set(theaterId, times);
    }
    setShowtimes(newShowtimes);
  };

  const handleSubmit = () => {
    const theatersData = Array.from(selectedTheaters)
      .map(theaterId => {
        const theater = allTheaters.find(t => t.id === theaterId);
        const times = showtimes.get(theaterId) || [];
        if (theater && times.length > 0) {
          return { theater, showtimes: times, duration };
        }
        return null;
      })
      .filter(Boolean) as any[];

    if (title && theatersData.length > 0) {
      onSubmit({ title, theaters: theatersData });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{movieLabel}</h3>

      <div className="space-y-4">
        {/* 映画タイトル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            映画タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: チェンソーマン レゼ篇"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 上映時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上映時間（分）
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 劇場選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上映劇場（複数選択可）
          </label>
          <div className="space-y-2">
            {allTheaters.map(theater => (
              <div key={theater.id} className="border border-gray-200 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTheaters.has(theater.id)}
                    onChange={() => toggleTheater(theater.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium">{theater.name}</span>
                  <span className="text-xs text-gray-500">({theater.location})</span>
                </label>

                {/* 上映時間選択ボタン */}
                {selectedTheaters.has(theater.id) && (
                  <div className="mt-3 ml-6">
                    <div className="text-xs text-gray-600 mb-2">上映時間を選択（複数選択可）</div>
                    <div className="grid grid-cols-6 gap-2">
                      {timeSlots.map(time => {
                        const isSelected = showtimes.get(theater.id)?.includes(time);
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => toggleShowtime(theater.id, time)}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-blue-500 text-white border-blue-600 font-medium'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* 選択済み上映時間の表示 */}
                    {showtimes.get(theater.id) && showtimes.get(theater.id)!.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        選択中: {showtimes.get(theater.id)!.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 登録ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!title || Array.from(selectedTheaters).every(id => !showtimes.get(id)?.length)}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          この映画を登録
        </button>
      </div>
    </div>
  );
}
