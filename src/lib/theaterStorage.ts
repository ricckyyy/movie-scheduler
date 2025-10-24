import type { Theater } from '@/types/movie';

const STORAGE_KEY = 'movie-scheduler-custom-theaters';

/**
 * LocalStorageを使ったカスタム映画館の永続化
 */
export const theaterStorage = {
  /**
   * カスタム映画館を読み込む
   */
  load: (): Theater[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load custom theaters:', error);
    }
    return [];
  },

  /**
   * カスタム映画館を保存
   */
  save: (theaters: Theater[]): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theaters));
      return true;
    } catch (error) {
      console.error('Failed to save custom theaters:', error);
      return false;
    }
  },

  /**
   * カスタム映画館を追加
   */
  add: (theater: Theater): Theater[] => {
    const theaters = theaterStorage.load();
    const newTheaters = [...theaters, theater];
    theaterStorage.save(newTheaters);
    return newTheaters;
  },

  /**
   * カスタム映画館を削除
   */
  remove: (theaterId: string): Theater[] => {
    const theaters = theaterStorage.load();
    const newTheaters = theaters.filter(t => t.id !== theaterId);
    theaterStorage.save(newTheaters);
    return newTheaters;
  },

  /**
   * 全てクリア
   */
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};

/**
 * 将来的なDB連携用のインターフェース
 * Supabase, Firebase, Prisma などに置き換え可能
 */
export interface TheaterStorageAdapter {
  load: () => Promise<Theater[]>;
  save: (theaters: Theater[]) => Promise<boolean>;
  add: (theater: Theater) => Promise<Theater[]>;
  remove: (theaterId: string) => Promise<Theater[]>;
  clear: () => Promise<void>;
}

/**
 * サンプル: Supabase用アダプター（未実装）
 * 
 * export const supabaseAdapter: TheaterStorageAdapter = {
 *   load: async () => {
 *     const { data, error } = await supabase
 *       .from('custom_theaters')
 *       .select('*');
 *     return data || [];
 *   },
 *   save: async (theaters) => {
 *     // 実装例...
 *   },
 *   // ...
 * };
 */
