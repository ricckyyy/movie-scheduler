import { Movie, ScheduleItem, DailySchedule } from '@/types/movie';

export class ScheduleGenerator {
  /**
   * 1日のスケジュールを生成
   * @param movies 視聴したい映画のリスト
   * @param startTime 開始時刻（デフォルト: 09:00）
   * @param maxDuration 最大視聴時間（分）（デフォルト: 12時間）
   */
  static generateDailySchedule(
    movies: Movie[],
    startTime: Date = new Date(new Date().setHours(9, 0, 0, 0)),
    maxDuration: number = 720 // 12時間
  ): DailySchedule {
    const scheduleItems: ScheduleItem[] = [];
    let currentTime = new Date(startTime);
    let totalDuration = 0;

    // 上映時間が短い順にソート（効率的に多くの映画を見る）
    const sortedMovies = [...movies].sort((a, b) => a.duration - b.duration);

    for (const movie of sortedMovies) {
      // 残り時間を確認
      if (totalDuration + movie.duration > maxDuration) {
        continue; // この映画は入らない
      }

      const startTime = new Date(currentTime);
      const endTime = new Date(currentTime.getTime() + movie.duration * 60000);

      scheduleItems.push({
        movie,
        startTime,
        endTime,
      });

      currentTime = endTime;
      totalDuration += movie.duration;
    }

    return {
      date: startTime,
      items: scheduleItems,
      totalDuration,
    };
  }

  /**
   * 時間をフォーマット
   */
  static formatTime(date: Date): string {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * 期間をフォーマット
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  }
}
