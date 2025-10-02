import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Event Calendar',
  description: 'Stock event calendar with voting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
