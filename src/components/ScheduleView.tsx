'use client';

import { DailySchedule } from '@/types/movie';
import { ScheduleGenerator } from '@/lib/scheduleGenerator';

interface ScheduleViewProps {
  schedule: DailySchedule | null;
}

export default function ScheduleView({ schedule }: ScheduleViewProps) {
  if (!schedule || schedule.items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">本日のスケジュール</h2>
        <p className="text-gray-500 text-center py-8">
          スケジュールを生成するボタンを押してください
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">本日のスケジュール</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">視聴映画数</p>
          <p className="text-2xl font-bold text-blue-600">{schedule.items.length}本</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">合計視聴時間</span>
          <span className="text-xl font-bold text-blue-600">
            {ScheduleGenerator.formatDuration(schedule.totalDuration)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {schedule.items.map((item, index) => (
          <div
            key={item.movie.id}
            className="relative pl-8 pb-8 border-l-2 border-blue-300 last:pb-0 last:border-l-0"
          >
            {/* タイムライン上の点 */}
            <div className="absolute left-0 top-0 w-4 h-4 -ml-[9px] bg-blue-500 rounded-full border-4 border-white"></div>
            
            <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded mb-2">
                    {index + 1}本目
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{item.movie.title}</h3>
                </div>
                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                  {item.movie.genre}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                <span className="flex items-center font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ScheduleGenerator.formatTime(item.startTime)} - {ScheduleGenerator.formatTime(item.endTime)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {item.movie.duration}分
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800 text-center">
          🎬 終了予定時刻: {ScheduleGenerator.formatTime(schedule.items[schedule.items.length - 1].endTime)}
        </p>
      </div>
    </div>
  );
}
