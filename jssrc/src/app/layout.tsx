'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.css'
import React from 'react'


const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

      <body className={inter.className} style={{
        margin: '2em 10%', width: '80%'
      }}>{children}</body>
    </html>
  )
}
