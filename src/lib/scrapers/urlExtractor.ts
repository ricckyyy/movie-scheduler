import axios from 'axios';
import * as cheerio from 'cheerio';
import type { MovieTheaterSchedule, Showtime, Theater } from '@/types/movie';
import { TOHO_THEATERS } from './toho';

/**
 * TOHOシネマズのURLから映画情報とスケジュールを抽出
 * 
 * 例: https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakuhin_cd=026725
 */
export async function extractScheduleFromURL(
  url: string
): Promise<{
  movieTitle: string;
  duration: number;
  schedules: MovieTheaterSchedule[];
}> {
  try {
    // URLの検証
    if (!url.includes('tohotheater.jp')) {
      throw new Error('TOHOシネマズのURLを入力してください');
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    // 映画タイトルを抽出
    let movieTitle = '';
    const titleSelectors = [
      'h1.movie-title',
      '.movie-name h2',
      'h2.title',
      '.detail-title',
      '#mainTitle',
    ];
    
    for (const selector of titleSelectors) {
      const text = $(selector).first().text().trim();
      if (text) {
        movieTitle = text;
        break;
      }
    }

    // 上映時間を抽出
    let duration = 120; // デフォルト
    const durationText = $('.movie-duration, .time-length, .runtime').first().text();
    const durationMatch = durationText.match(/(\d+)分/);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
    }

    // 各劇場のスケジュールを抽出
    const schedules: MovieTheaterSchedule[] = [];
    
    // 劇場ごとのスケジュールセクションを探す
    $('.theater-schedule, .schedule-theater, .cinema-schedule').each((_, theaterSection) => {
      const theaterName = $(theaterSection).find('.theater-name, .cinema-name, h3').first().text().trim();
      
      // 劇場名から対応するTheaterオブジェクトを探す
      const theater = TOHO_THEATERS.find(t => 
        theaterName.includes(t.location) || t.name.includes(theaterName)
      );
      
      if (!theater) return;

      const showtimes: Showtime[] = [];
      
      // 上映時間を抽出
      $(theaterSection).find('.showtime, .time-button, .screening-time').each((_, timeElement) => {
        const timeText = $(timeElement).text().trim();
        const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
        
        if (timeMatch) {
          const time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
          const available = !$(timeElement).hasClass('disabled') && 
                           !$(timeElement).hasClass('soldout') &&
                           !$(timeElement).text().includes('×');
          
          showtimes.push({ time, available });
        }
      });

      if (showtimes.length > 0) {
        schedules.push({
          movie: { title: movieTitle, duration },
          theater,
          showtimes,
          date: new Date().toISOString().split('T')[0],
        });
      }
    });

    return {
      movieTitle,
      duration,
      schedules,
    };
  } catch (error) {
    console.error('Error extracting schedule from URL:', error);
    throw error;
  }
}

/**
 * URLからサクヒンコードを抽出
 */
export function extractSakuhinCode(url: string): string | null {
  const match = url.match(/sakuhin_cd=(\d+)/);
  return match ? match[1] : null;
}

/**
 * サクヒンコードから直接スケジュールを取得
 * より確実な方法
 */
export async function fetchScheduleBySakuhinCode(
  sakuhinCode: string
): Promise<MovieTheaterSchedule[]> {
  try {
    // 映画詳細ページを取得
    const movieUrl = `https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakuhin_cd=${sakuhinCode}`;
    const movieResponse = await axios.get(movieUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(movieResponse.data);
    
    // 映画タイトルと上映時間を取得
    const movieTitle = $('h2.movie-title, .title-area h2').first().text().trim();
    const durationText = $('.movie-info .duration, .time-info').text();
    const durationMatch = durationText.match(/(\d+)分/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 120;

    const schedules: MovieTheaterSchedule[] = [];

    // 各劇場でのスケジュールを取得
    for (const theater of TOHO_THEATERS) {
      try {
        const theaterCode = getTheaterCode(theater.id);
        const scheduleUrl = `https://hlo.tohotheater.jp/net/schedule/TNPI3020J01.do?sakuhin_cd=${sakuhinCode}&theater_cd=${theaterCode}`;
        
        const scheduleResponse = await axios.get(scheduleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const $schedule = cheerio.load(scheduleResponse.data);
        const showtimes: Showtime[] = [];

        // 上映時間を抽出（実際のHTML構造に応じて調整）
        $schedule('.time-schedule .btn-time, .showtime-btn, a.time').each((_, element) => {
          const timeText = $schedule(element).text().trim();
          const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
          
          if (timeMatch) {
            const time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
            const available = !$schedule(element).hasClass('disabled') &&
                             !$schedule(element).hasClass('soldout');
            
            showtimes.push({ time, available });
          }
        });

        if (showtimes.length > 0) {
          schedules.push({
            movie: { title: movieTitle, duration },
            theater,
            showtimes,
            date: new Date().toISOString().split('T')[0],
          });
        }

        // レート制限のための待機
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching schedule for ${theater.name}:`, error);
      }
    }

    return schedules;
  } catch (error) {
    console.error('Error fetching schedule by sakuhin code:', error);
    throw error;
  }
}

function getTheaterCode(theaterId: string): string {
  const codes: Record<string, string> = {
    'toho-shinjuku': '008',
    'toho-ikebukuro': '010',
    'toho-shibuya': '011',
    'toho-roppongi': '003',
    'toho-hibiya': '071',
  };
  return codes[theaterId] || '008';
}

/**
 * URLから直接スケジュールを取得する簡易版
 */
export async function quickFetchFromURL(url: string): Promise<MovieTheaterSchedule[]> {
  const sakuhinCode = extractSakuhinCode(url);
  
  if (!sakuhinCode) {
    throw new Error('URLからサクヒンコードを抽出できませんでした');
  }

  return fetchScheduleBySakuhinCode(sakuhinCode);
}
