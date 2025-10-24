import type { MovieTheaterSchedule, SchedulePattern, Theater } from '@/types/movie';
import { getRealTravelTime } from './googleMaps';

/**
 * 2地点間の移動時間を計算（分）
 * Google Maps APIを使用して実際の移動時間を取得
 */
async function calculateTravelTime(theater1: Theater, theater2: Theater): Promise<number> {
  // Google Maps APIで実際の移動時間を取得
  return await getRealTravelTime(theater1, theater2);
}

/**
 * 時間文字列を分に変換
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 分を時間文字列に変換
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 2つの映画を連続で見るためのスケジュールパターンを生成
 */
export async function generateSchedulePatterns(
  movieASchedules: MovieTheaterSchedule[],
  movieBSchedules: MovieTheaterSchedule[],
  date: string
): Promise<SchedulePattern[]> {
  const patterns: SchedulePattern[] = [];
  let patternId = 1;

  // 映画Aの各劇場・上映時間について
  for (const scheduleA of movieASchedules) {
    for (const showtimeA of scheduleA.showtimes.filter(s => s.available)) {
      const startTimeA = timeToMinutes(showtimeA.time);
      const endTimeA = startTimeA + scheduleA.movie.duration;

      // 映画Bの各劇場・上映時間について
      for (const scheduleB of movieBSchedules) {
        const travelTime = await calculateTravelTime(scheduleA.theater, scheduleB.theater);

        for (const showtimeB of scheduleB.showtimes.filter(s => s.available)) {
          const startTimeB = timeToMinutes(showtimeB.time);
          const endTimeB = startTimeB + scheduleB.movie.duration;

          // 映画Aが終わってから移動時間を考慮して映画Bに間に合うか
          const requiredTimeB = endTimeA + travelTime;
          const bufferTime = startTimeB - requiredTimeB; // 余裕時間

          // 余裕時間が-10分〜60分の範囲なら実行可能とする
          // （多少の遅れは許容、長すぎる待ち時間は避ける）
          const feasible = bufferTime >= -10 && bufferTime <= 60;

          const totalTime = endTimeB - startTimeA;

          patterns.push({
            id: patternId++,
            movieA: {
              title: scheduleA.movie.title,
              theater: scheduleA.theater,
              showtime: showtimeA.time,
              endTime: minutesToTime(endTimeA),
            },
            movieB: {
              title: scheduleB.movie.title,
              theater: scheduleB.theater,
              showtime: showtimeB.time,
              endTime: minutesToTime(endTimeB),
            },
            travelTime,
            totalTime,
            feasible,
          });
        }
      }
    }
  }

  // 実行可能なパターンを優先し、合計時間が短い順にソート
  return patterns
    .sort((a, b) => {
      if (a.feasible !== b.feasible) {
        return a.feasible ? -1 : 1;
      }
      return a.totalTime - b.totalTime;
    })
    .slice(0, 20); // 上位20パターンのみ返す
}

/**
 * 逆順のパターンも生成（映画B → 映画A）
 */
export async function generateAllSchedulePatterns(
  movieASchedules: MovieTheaterSchedule[],
  movieBSchedules: MovieTheaterSchedule[],
  date: string
): Promise<SchedulePattern[]> {
  const patternsAB = await generateSchedulePatterns(movieASchedules, movieBSchedules, date);
  const patternsBA = await generateSchedulePatterns(movieBSchedules, movieASchedules, date);

  // 両方のパターンを結合してソート
  const allPatterns = [...patternsAB, ...patternsBA]
    .sort((a, b) => {
      if (a.feasible !== b.feasible) {
        return a.feasible ? -1 : 1;
      }
      return a.totalTime - b.totalTime;
    })
    .slice(0, 20);

  // IDを再採番してユニークにする
  return allPatterns.map((pattern, index) => ({
    ...pattern,
    id: index + 1,
  }));
}
