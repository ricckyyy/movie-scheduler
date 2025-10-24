export interface Movie {
  id: string;
  title: string;
  duration: number; // 分単位
  genre: string;
  addedAt: Date;
}

export interface ScheduleItem {
  movie: Movie;
  startTime: Date;
  endTime: Date;
}

export interface DailySchedule {
  date: Date;
  items: ScheduleItem[];
  totalDuration: number;
}

// 映画館情報
export interface Theater {
  id: string;
  name: string;
  location: string; // 新宿、池袋など
  address: string;
  latitude?: number;
  longitude?: number;
}

// 上映時間
export interface Showtime {
  time: string; // "10:00", "14:30" など
  available: boolean; // 予約可能かどうか
}

// 映画の上映スケジュール（映画館ごと）
export interface MovieTheaterSchedule {
  movie: {
    title: string;
    duration: number;
  };
  theater: Theater;
  showtimes: Showtime[];
  date: string; // "2025-10-25"
}

// スケジュールパターン（2つの映画を連続で見る）
export interface SchedulePattern {
  id: number;
  movieA: {
    title: string;
    theater: Theater;
    showtime: string;
    endTime: string;
  };
  movieB: {
    title: string;
    theater: Theater;
    showtime: string;
    endTime: string;
  };
  travelTime: number; // 移動時間（分）
  totalTime: number; // 合計時間（分）
  feasible: boolean; // 実行可能かどうか
}
