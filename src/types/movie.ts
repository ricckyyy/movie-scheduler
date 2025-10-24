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
