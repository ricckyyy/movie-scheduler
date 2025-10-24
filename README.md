# 🎬 映画スケジューラー

見たい映画を登録して、1日で効率的に視聴するためのスケジュールを自動生成するWebアプリケーションです。

## 機能

- **映画登録**: タイトル、上映時間、ジャンルを入力して映画を登録
- **映画リスト管理**: 登録した映画の一覧表示と削除
- **自動スケジュール生成**: 1日（デフォルト12時間）で視聴できる映画のスケジュールを自動作成
- **タイムライン表示**: 各映画の開始・終了時刻を視覚的に表示
- **レスポンシブデザイン**: スマートフォンからデスクトップまで対応

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: React Hooks (useState)

## セットアップ

### 必要な環境

- Node.js 20.9.0以上
- npm

### インストール

既に依存関係はインストール済みです。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 使い方

1. **映画を登録する**
   - 左側のフォームに映画タイトル、上映時間（分）、ジャンルを入力
   - 「映画を追加」ボタンをクリック

2. **登録した映画を確認**
   - 右側のリストに登録済みの映画が表示されます
   - 削除したい場合はゴミ箱アイコンをクリック

3. **スケジュールを生成**
   - 「スケジュールを生成する」ボタンをクリック
   - 1日（12時間）で視聴できる映画のスケジュールが自動的に作成されます
   - 短い映画から優先的にスケジュールに組み込まれます

## プロジェクト構成

```
src/
├── app/
│   ├── page.tsx          # メインページ
│   ├── layout.tsx        # レイアウト
│   └── globals.css       # グローバルスタイル
├── components/
│   ├── MovieForm.tsx     # 映画登録フォーム
│   ├── MovieList.tsx     # 映画リスト表示
│   └── ScheduleView.tsx  # スケジュール表示
├── lib/
│   └── scheduleGenerator.ts  # スケジュール生成ロジック
└── types/
    └── movie.ts          # 型定義
```

## ビルド

```bash
npm run build
npm start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

© 2025 Movie Scheduler

