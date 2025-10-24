# 映画スケジューラープロジェクト

このプロジェクトは、見たい映画を登録して1日の視聴スケジュールを自動生成するNext.jsアプリケーションです。

## 技術スタック
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks

## プロジェクト構造
- `src/app/`: Next.jsページとレイアウト
- `src/components/`: Reactコンポーネント（MovieForm, MovieList, ScheduleView）
- `src/lib/`: ビジネスロジック（scheduleGenerator）
- `src/types/`: TypeScript型定義

## 開発
```bash
npm run dev
```

## ビルド
```bash
npm run build
npm start
```
