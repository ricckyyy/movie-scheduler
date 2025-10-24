/**
 * 実際の映画館・上映スケジュールデータ取得
 * 
 * 注意: 
 * 1. TOHOシネマズには公式APIがないため、スクレイピングが必要
 * 2. スクレイピングは利用規約違反の可能性があるため、本番環境では使用しないでください
 * 3. より良いアプローチ:
 *    - 映画配給会社と直接契約
 *    - 公式データフィードの利用
 *    - 許可されたAPIサービスの利用
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { MovieTheaterSchedule, Showtime, Theater } from '@/types/movie';
import { TOHO_THEATERS } from './toho';

/**
 * TOHOシネマズの実際の上映中映画リストを取得
 */
export async function fetchNowShowingMovies(): Promise<string[]> {
  try {
    const url = 'https://hlo.tohotheater.jp/net/movie/TNPI3090J01.do';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const movies: string[] = [];

    // 映画タイトルを抽出（実際のセレクタに合わせて調整が必要）
    $('.movie-box .movie-title, .movie-info h3').each((_, element) => {
      const title = $(element).text().trim();
      if (title) {
        movies.push(title);
      }
    });

    return movies;
  } catch (error) {
    console.error('Error fetching now showing movies:', error);
    return [];
  }
}

/**
 * より実用的なアプローチ: 
 * 実際のデータを持つAPIサービスを使用
 * 
 * 以下のようなサービスが利用可能:
 * 1. TMDb API - 映画の基本情報（ただし日本の上映館情報は限定的）
 * 2. Gracenote API - 映画情報とスケジュール
 * 3. Rovi API - エンターテインメントデータ
 * 4. 映画.comやFilmarksとの業務提携
 */

/**
 * TMDb APIを使用した実際の映画検索
 * API Key: https://www.themoviedb.org/settings/api で取得
 */
export async function searchMoviesFromTMDb(query: string): Promise<any[]> {
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY not found. Please set it in .env.local');
    return [];
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          query,
          language: 'ja-JP',
          region: 'JP',
        },
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error('Error searching movies from TMDb:', error);
    return [];
  }
}

/**
 * 実際のスケジュール取得の代替案:
 * 手動でキュレーションされたデータベースを使用
 * 
 * これは最も信頼性が高く、合法的なアプローチです
 */
export async function fetchRealSchedulesFromDatabase(
  movieTitle: string,
  date: string
): Promise<MovieTheaterSchedule[]> {
  // TODO: データベースやAPIから実際のスケジュールを取得
  // 例: Supabase, Firebase, PostgreSQL など
  
  try {
    // 仮の実装: 実際にはデータベースから取得
    const response = await fetch(`/api/schedules/database?title=${encodeURIComponent(movieTitle)}&date=${date}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from database');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching schedules from database:', error);
    return [];
  }
}

/**
 * 実用的な解決策: Webスクレイピングサービスを使用
 * 
 * 以下のようなサービスが利用可能:
 * - ScraperAPI (https://www.scraperapi.com/)
 * - Bright Data (https://brightdata.com/)
 * - Apify (https://apify.com/)
 * 
 * これらのサービスは:
 * - 法的に問題のない方法でデータを取得
 * - レート制限の管理
 * - プロキシローテーション
 * - CAPTCHAの回避
 */
export async function fetchSchedulesViaScraperAPI(
  movieTitle: string,
  theaterCode: string,
  date: string
): Promise<Showtime[]> {
  const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
  
  if (!SCRAPER_API_KEY) {
    console.warn('SCRAPER_API_KEY not found');
    return [];
  }

  try {
    const url = `https://hlo.tohotheater.jp/net/schedule/TNPI3020J01.do?theater_cd=${theaterCode}`;
    const apiUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;
    
    const response = await axios.get(apiUrl);
    const $ = cheerio.load(response.data);
    
    const showtimes: Showtime[] = [];
    
    // HTML構造に応じてパース（実際のサイト構造に合わせて調整）
    $('.showtime-list .time').each((_, element) => {
      const time = $(element).text().trim();
      const available = !$(element).hasClass('soldout');
      
      if (time.match(/^\d{2}:\d{2}$/)) {
        showtimes.push({ time, available });
      }
    });
    
    return showtimes;
  } catch (error) {
    console.error('Error fetching via ScraperAPI:', error);
    return [];
  }
}

/**
 * 最も推奨される方法: ユーザーが手動で入力
 * 
 * 実際の映画館のウェブサイトを見ながら、ユーザーが:
 * 1. 見たい映画を選択
 * 2. 各映画館での上映時間を手動で入力
 * 3. システムが最適なスケジュールを提案
 * 
 * これは:
 * - 法的に問題なし
 * - 最新の正確な情報
 * - 特別上映や条件も考慮可能
 */
export function createScheduleFromUserInput(
  movieTitle: string,
  theater: Theater,
  showtimes: string[], // ユーザーが入力した時間のリスト
  duration: number,
  date: string
): MovieTheaterSchedule {
  return {
    movie: {
      title: movieTitle,
      duration,
    },
    theater,
    showtimes: showtimes.map(time => ({
      time,
      available: true,
    })),
    date,
  };
}
