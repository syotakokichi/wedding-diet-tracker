import './globals.css'

export const metadata = {
  title: '結婚式ダイエットトラッカー',
  description: '結婚式に向けたダイエット記録アプリ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}