# 結婚式ダイエットトラッカー

結婚式に向けた体重管理と習慣形成をサポートするWebアプリケーション

## 🎯 概要

2025年12月11日の結婚式に向けて、目標体重達成をサポートするトラッカーアプリです。
体重記録だけでなく、日々の習慣形成も同時に管理できます。

## ✨ 主な機能

- **体重記録**: 日々の体重を記録し、前日比で色分け表示
- **目標ペース表示**: 各日付に目標達成に必要な体重を表示
- **習慣トラッキング**: 3つのカテゴリーから習慣を選択
  - 朝食改善
  - 食事全般
  - 生活習慣
- **ポイント制**: 各カテゴリーから1つ以上達成で1ポイント（1日3ポイント目標）
- **運動記録**: feelcycleやその他の運動を記録
- **励ましメッセージ**: 達成度に応じた応援メッセージ表示

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **データベース**: Firebase Firestore
- **アイコン**: Lucide React

## 📦 インストール

```bash
# リポジトリのクローン
git clone https://github.com/syotakokichi/wedding-diet-tracker.git

# ディレクトリに移動
cd wedding-diet-tracker-web

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 🔧 環境設定

Firebaseの設定を行うため、`lib/firebase.js`に以下の情報を設定してください：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## 📱 使い方

1. カレンダーの日付をクリックして記録画面を開く
2. 体重を入力（目標ペースとの比較が表示されます）
3. 各カテゴリーから実施した習慣を選択
4. 運動の有無を記録
5. 必要に応じてメモを追加
6. 保存ボタンで記録を保存

## 🎨 カスタマイズ

`app/constants/habitCategories.js`で目標値や習慣項目をカスタマイズできます：

```javascript
export const initialGoals = {
  startWeight: 82,      // 開始体重
  targetWeight: 68,     // 目標体重
  height: 174,          // 身長
  weeklyFeelcycle: 3    // 週間feelcycle目標回数
};
```

## 📄 ライセンス

MIT