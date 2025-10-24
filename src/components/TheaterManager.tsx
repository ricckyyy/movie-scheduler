'use client';

import { useState } from 'react';
import type { Theater } from '@/types/movie';

interface TheaterManagerProps {
  customTheaters: Theater[];
  onAddTheater: (theater: Theater) => void;
  onRemoveTheater: (theaterId: string) => void;
}

export default function TheaterManager({ customTheaters, onAddTheater, onRemoveTheater }: TheaterManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    if (!name || !address) {
      alert('映画館名と住所を入力してください');
      return;
    }

    const newTheater: Theater = {
      id: `custom-${Date.now()}`,
      name,
      location: location || name,
      address,
      latitude: 0, // Google Maps APIが住所から自動計算
      longitude: 0,
    };

    onAddTheater(newTheater);
    setName('');
    setLocation('');
    setAddress('');
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">🏢 カスタム映画館</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
        >
          {isOpen ? '閉じる' : '+ 映画館を追加'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              映画館名 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ユナイテッド・シネマ豊洲"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              エリア（任意）
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例: 豊洲"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              住所 *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 東京都江東区豊洲2-4-9 アーバンドックららぽーと豊洲"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Google Maps APIで移動時間を計算するため、正確な住所を入力してください
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
          >
            追加
          </button>
        </div>
      )}

      {/* 登録済みカスタム映画館一覧 */}
      {customTheaters.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">登録済み ({customTheaters.length}件)</p>
          {customTheaters.map((theater) => (
            <div
              key={theater.id}
              className="flex justify-between items-start p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div>
                <div className="font-medium text-gray-900">{theater.name}</div>
                <div className="text-xs text-gray-600">{theater.address}</div>
              </div>
              <button
                onClick={() => onRemoveTheater(theater.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}

      {customTheaters.length === 0 && !isOpen && (
        <p className="text-sm text-gray-500 text-center py-4">
          まだカスタム映画館が登録されていません
        </p>
      )}
    </div>
  );
}
