/**
 * Google Maps APIを使用した実際の移動時間計算
 */

import type { Theater } from '@/types/movie';

/**
 * Google Maps Distance Matrix APIで実際の移動時間を取得（サーバーサイド）
 */
export async function getRealTravelTime(
  origin: Theater,
  destination: Theater
): Promise<number> {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API Key not found. Using estimated time.');
    return estimateTravelTime(origin, destination);
  }

  // 同じ劇場の場合
  if (origin.id === destination.id) return 0;

  try {
    const originAddr = encodeURIComponent(origin.address);
    const destAddr = encodeURIComponent(destination.address);
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originAddr}&destinations=${destAddr}&mode=transit&language=ja&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const durationInSeconds = data.rows[0].elements[0].duration.value;
      return Math.ceil(durationInSeconds / 60); // 分単位に変換
    }

    // APIが失敗した場合は推定値を返す
    console.warn(`Google Maps API failed for ${origin.name} -> ${destination.name}, using estimate`);
    return estimateTravelTime(origin, destination);
  } catch (error) {
    console.error('Error fetching travel time from Google Maps:', error);
    return estimateTravelTime(origin, destination);
  }
}

/**
 * 推定移動時間（フォールバック用）
 */
function estimateTravelTime(origin: Theater, destination: Theater): number {
  if (origin.id === destination.id) return 0;

  // 座標がある場合はHaversine formulaで距離計算
  if (origin.latitude && origin.longitude && destination.latitude && destination.longitude) {
    const lat1 = origin.latitude * Math.PI / 180;
    const lat2 = destination.latitude * Math.PI / 180;
    const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
    const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c; // km

    // 電車の平均速度30km/h + 乗り換え時間15分
    return Math.ceil((distance / 30) * 60 + 15);
  }

  // デフォルト値
  return 30;
}

/**
 * 複数の劇場間の移動時間を一括取得（効率化）
 */
export async function getBatchTravelTimes(
  theaters: Theater[]
): Promise<Map<string, Map<string, number>>> {
  const travelTimeMap = new Map<string, Map<string, number>>();

  for (const origin of theaters) {
    const originMap = new Map<string, number>();
    
    for (const destination of theaters) {
      if (origin.id === destination.id) {
        originMap.set(destination.id, 0);
      } else {
        const time = await getRealTravelTime(origin, destination);
        originMap.set(destination.id, time);
        
        // レート制限対策（1秒待機）
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    travelTimeMap.set(origin.id, originMap);
  }

  return travelTimeMap;
}
