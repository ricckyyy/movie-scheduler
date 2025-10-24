# カスタム映画館データの永続化

現在、カスタム映画館のデータは**ブラウザのLocalStorage**に保存されています。

## 現在の仕様

- **保存先**: ブラウザのLocalStorage
- **保存タイミング**: 映画館の追加・削除時に自動保存
- **データの保持**: ブラウザのキャッシュをクリアしない限り永続
- **制限**: 同じブラウザ・同じデバイスでのみアクセス可能

## データベース連携（オプション）

本格的に運用する場合は、以下のようなデータベースサービスを使用できます。

### 1. Supabase（推奨）

無料枠があり、Next.jsとの連携が簡単です。

#### セットアップ手順

```bash
npm install @supabase/supabase-js
```

#### データベーススキーマ

```sql
create table custom_theaters (
  id text primary key,
  name text not null,
  location text,
  address text not null,
  latitude real default 0,
  longitude real default 0,
  created_at timestamp with time zone default now(),
  user_id text -- ユーザー認証を使う場合
);
```

#### 実装例

`src/lib/supabaseTheaterStorage.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Theater } from '@/types/movie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseTheaterStorage = {
  load: async (): Promise<Theater[]> => {
    const { data, error } = await supabase
      .from('custom_theaters')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  add: async (theater: Theater): Promise<Theater[]> => {
    await supabase
      .from('custom_theaters')
      .insert([theater]);
    
    return await supabaseTheaterStorage.load();
  },

  remove: async (theaterId: string): Promise<Theater[]> => {
    await supabase
      .from('custom_theaters')
      .delete()
      .eq('id', theaterId);
    
    return await supabaseTheaterStorage.load();
  },
};
```

### 2. Prisma + PostgreSQL/MySQL

より本格的なアプリケーションに適しています。

#### セットアップ

```bash
npm install prisma @prisma/client
npx prisma init
```

#### スキーマ定義

`prisma/schema.prisma`:

```prisma
model CustomTheater {
  id        String   @id @default(cuid())
  name      String
  location  String?
  address   String
  latitude  Float    @default(0)
  longitude Float    @default(0)
  createdAt DateTime @default(now())
}
```

#### マイグレーション

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### 実装例

`src/lib/prismaTheaterStorage.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import type { Theater } from '@/types/movie';

const prisma = new PrismaClient();

export const prismaTheaterStorage = {
  load: async (): Promise<Theater[]> => {
    const theaters = await prisma.customTheater.findMany();
    return theaters.map(t => ({
      id: t.id,
      name: t.name,
      location: t.location || '',
      address: t.address,
      latitude: t.latitude,
      longitude: t.longitude,
    }));
  },

  add: async (theater: Theater): Promise<Theater[]> => {
    await prisma.customTheater.create({
      data: theater,
    });
    return await prismaTheaterStorage.load();
  },

  remove: async (theaterId: string): Promise<Theater[]> => {
    await prisma.customTheater.delete({
      where: { id: theaterId },
    });
    return await prismaTheaterStorage.load();
  },
};
```

### 3. Firebase Firestore

Googleのサービスで、リアルタイム同期が可能です。

```bash
npm install firebase
```

`src/lib/firebaseTheaterStorage.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  // Firebase config
});

const db = getFirestore(app);

export const firebaseTheaterStorage = {
  load: async () => {
    const snapshot = await getDocs(collection(db, 'custom_theaters'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  // ...
};
```

## 切り替え方法

`src/app/page.tsx`で使用するストレージを切り替えられます：

```typescript
// LocalStorage（デフォルト）
import { theaterStorage } from '@/lib/theaterStorage';

// Supabaseに切り替え
import { supabaseTheaterStorage as theaterStorage } from '@/lib/supabaseTheaterStorage';

// Prismaに切り替え
import { prismaTheaterStorage as theaterStorage } from '@/lib/prismaTheaterStorage';
```

## 推奨

- **個人利用・プロトタイプ**: LocalStorage（現状のまま）
- **小規模アプリ・無料運用**: Supabase
- **本格運用・スケーラビリティ重視**: Prisma + PostgreSQL
- **リアルタイム同期が必要**: Firebase
