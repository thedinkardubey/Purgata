import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Purgata',
  description: 'Purgata - A movie review sentiment analysis tool.',
  generator: 'Developed by Dinkar for Purgata',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
