import { Theater } from '@/types/movie';

/**
 * 東京のTOHOシネマズ一覧
 */
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
    address: '東京都豊島区東池袋1-22-10 ヒューマックスパビリオン池袋サンシャイン60通り7F',
    latitude: 35.7295,
    longitude: 139.7157,
  },
  {
    id: 'toho-hibiya',
    name: 'TOHOシネマズ 日比谷',
    location: '日比谷',
    address: '東京都千代田区有楽町1-1-3 東京宝塚ビル地下1F',
    latitude: 35.6705,
    longitude: 139.7593,
  },
];
