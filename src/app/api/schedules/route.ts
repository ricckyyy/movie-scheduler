import { NextRequest, NextResponse } from 'next/server';
import { getMockSchedules, scrapeTohoSchedule } from '@/lib/scrapers/toho';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieTitle = searchParams.get('title');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const useMock = searchParams.get('mock') === 'true';

  if (!movieTitle) {
    return NextResponse.json(
      { error: 'Movie title is required' },
      { status: 400 }
    );
  }

  try {
    let schedules;
    
    if (useMock) {
      // モックデータを使用（開発・テスト用）
      schedules = getMockSchedules(movieTitle, date);
    } else {
      // 実際のスクレイピングを実行
      // 注: 本番環境では利用規約を確認してください
      schedules = await scrapeTohoSchedule(movieTitle, date);
      
      // スクレイピングに失敗した場合はモックデータにフォールバック
      if (schedules.length === 0) {
        console.warn('Scraping failed, falling back to mock data');
        schedules = getMockSchedules(movieTitle, date);
      }
    }

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}
