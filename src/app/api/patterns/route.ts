import { NextRequest, NextResponse } from 'next/server';
import { getMockSchedules } from '@/lib/scrapers/toho';
import { generateAllSchedulePatterns } from '@/lib/scheduleOptimizer';
import { quickFetchFromURL, extractSakuhinCode } from '@/lib/scrapers/urlExtractor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movieA, movieB, date, useRealData = false, schedulesA, schedulesB } = body;

    const targetDate = date || new Date().toISOString().split('T')[0];

    let finalSchedulesA, finalSchedulesB;

    // 直接スケジュールが渡された場合（手動入力）
    if (schedulesA && schedulesB) {
      finalSchedulesA = schedulesA;
      finalSchedulesB = schedulesB;
    } else if (!movieA || !movieB) {
      return NextResponse.json(
        { error: 'Both movieA and movieB are required' },
        { status: 400 }
      );
    } else {
      // 従来の方式（タイトルまたはURL）
      // URLが入力された場合は実データを取得
      if (useRealData && (movieA.includes('http') || movieB.includes('http'))) {
        try {
          // 映画AがURLの場合
          if (movieA.includes('tohotheater.jp')) {
            finalSchedulesA = await quickFetchFromURL(movieA);
          } else {
            finalSchedulesA = getMockSchedules(movieA, targetDate);
          }

          // 映画BがURLの場合
          if (movieB.includes('tohotheater.jp')) {
            finalSchedulesB = await quickFetchFromURL(movieB);
          } else {
            finalSchedulesB = getMockSchedules(movieB, targetDate);
          }
        } catch (error) {
          console.error('Error fetching real data:', error);
          // エラーの場合はモックデータにフォールバック
          finalSchedulesA = getMockSchedules(movieA, targetDate);
          finalSchedulesB = getMockSchedules(movieB, targetDate);
        }
      } else {
        // モックデータを使用
        finalSchedulesA = getMockSchedules(movieA, targetDate);
        finalSchedulesB = getMockSchedules(movieB, targetDate);
      }
    }

    if (finalSchedulesA.length === 0 || finalSchedulesB.length === 0) {
      return NextResponse.json(
        { error: 'No schedules found for one or both movies' },
        { status: 404 }
      );
    }

    // スケジュールパターンを生成
    const patterns = await generateAllSchedulePatterns(finalSchedulesA, finalSchedulesB, targetDate);

    return NextResponse.json({
      patterns,
      totalPatterns: patterns.length,
      feasiblePatterns: patterns.filter(p => p.feasible).length,
    });
  } catch (error) {
    console.error('Error generating patterns:', error);
    return NextResponse.json(
      { error: 'Failed to generate schedule patterns' },
      { status: 500 }
    );
  }
}
