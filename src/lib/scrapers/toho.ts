import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import type { Theater, MovieTheaterSchedule, Showtime } from '@/types/movie';

// 東京のTOHOシネマズ劇場リスト
export const TOHO_THEATERS: Theater[] = [
  {
    id: 'toho-shinjuku',
    name: 'TOHOシネマズ 新宿',
    location: '新宿',
    address: '東京都新宿区歌舞伎町1-19-1 新宿東宝ビル3F',
    latitude: 35.6938,
    longitude: 139.7006,
  },
  {
    id: 'toho-ikebukuro',
    name: 'TOHOシネマズ 池袋',
    location: '池袋',
    address: '東京都豊島区東池袋1-41-2',
    latitude: 35.7295,
    longitude: 139.7174,
  },
  {
    id: 'toho-shibuya',
    name: 'TOHOシネマズ 渋谷',
    location: '渋谷',
    address: '東京都渋谷区道玄坂2-6-17',
    latitude: 35.6580,
    longitude: 139.6982,
  },
  {
    id: 'toho-roppongi',
    name: 'TOHOシネマズ 六本木ヒルズ',
    location: '六本木',
    address: '東京都港区六本木6-10-2 六本木ヒルズけやき坂コンプレックス内',
    latitude: 35.6604,
    longitude: 139.7292,
  },
  {
    id: 'toho-hibiya',
    name: 'TOHOシネマズ 日比谷',
    location: '日比谷',
    address: '東京都千代田区有楽町1-1-3 東京宝塚ビル地下1F',
    latitude: 35.6748,
    longitude: 139.7601,
  },
];

/**
 * TOHOシネマズの上映スケジュールを取得
 * 注意: 実際のスクレイピングは利用規約に従って使用してください
 */
export async function scrapeTohoSchedule(
  movieTitle: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<MovieTheaterSchedule[]> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const schedules: MovieTheaterSchedule[] = [];

    for (const theater of TOHO_THEATERS) {
      try {
        const page = await browser.newPage();
        
        // TOHOシネマズの上映スケジュールページにアクセス
        // 注: 実際のURL構造は変更される可能性があります
        const url = `https://hlo.tohotheater.jp/net/schedule/TNPI3020J01.do?theater_cd=${getTheaterCode(theater.id)}`;
        
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // ページの内容を取得
        const content = await page.content();
        const $ = cheerio.load(content);
        
        // 映画タイトルを検索
        const showtimes: Showtime[] = [];
        
        // HTML構造に応じてセレクタを調整
        // これは例です。実際のサイトのHTMLに合わせて修正が必要
        $('.movie-schedule').each((_, element) => {
          const title = $(element).find('.movie-title').text().trim();
          
          if (title.includes(movieTitle)) {
            $(element).find('.showtime').each((_, timeElement) => {
              const time = $(timeElement).text().trim();
              const available = !$(timeElement).hasClass('soldout');
              
              showtimes.push({
                time,
                available,
              });
            });
          }
        });

        if (showtimes.length > 0) {
          schedules.push({
            movie: {
              title: movieTitle,
              duration: 120, // デフォルト値、実際の上映時間を取得する必要あり
            },
            theater,
            showtimes,
            date,
          });
        }

        await page.close();
      } catch (error) {
        console.error(`Error scraping ${theater.name}:`, error);
      }
    }

    await browser.close();
    return schedules;
  } catch (error) {
    console.error('Error in scrapeTohoSchedule:', error);
    return [];
  }
}

/**
 * 劇場IDからTOHOシネマズの劇場コードを取得
 */
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
 * APIベースでの上映スケジュール取得（代替方法）
 * より安定した方法として、映画館APIが利用可能な場合はこちらを使用
 */
export async function fetchTohoScheduleAPI(
  movieTitle: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<MovieTheaterSchedule[]> {
  // TODO: 実際のAPIエンドポイントが利用可能になった場合に実装
  // 現在はスクレイピングまたはモックデータを使用
  
  console.warn('API method not yet implemented. Use mock data or scraping.');
  return getMockSchedules(movieTitle, date);
}

/**
 * モックデータ（開発・テスト用）
 * 実際のスクレイピングが難しい場合の代替
 */
export function getMockSchedules(
  movieTitle: string,
  date: string = new Date().toISOString().split('T')[0]
): MovieTheaterSchedule[] {
  // 実際の上映スケジュールに近いモックデータ
  return TOHO_THEATERS.map(theater => ({
    movie: {
      title: movieTitle,
      duration: 120,
    },
    theater,
    showtimes: generateRealisticShowtimes(),
    date,
  }));
}

/**
 * リアルな上映時間を生成
 */
function generateRealisticShowtimes(): Showtime[] {
  const times = [
    '09:00', '10:30', '11:00', '12:30', '13:00', '14:30', 
    '15:00', '16:30', '17:00', '18:30', '19:00', '20:30', '21:00'
  ];
  
  return times.map(time => ({
    time,
    available: Math.random() > 0.2, // 80%の確率で予約可能
  }));
}
