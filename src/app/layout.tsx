import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import ConsoleSuppressor from '@/components/console-suppressor'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpusMentis - AI-Powered Study Assistant",
  description: "Transform your study materials into interactive summaries, flashcards, and kanban boards with AI-powered processing.",
  keywords: ["study", "AI", "education", "flashcards", "summarization", "learning"],
  authors: [{ name: "OpusMentis Team" }],
  openGraph: {
    title: "OpusMentis - AI-Powered Study Assistant",
    description: "Transform your study materials into interactive summaries, flashcards, and kanban boards with AI-powered processing.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpusMentis - AI-Powered Study Assistant",
    description: "Transform your study materials into interactive summaries, flashcards, and kanban boards with AI-powered processing.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <body className={inter.className}>
          <ConsoleSuppressor />
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #e5e7eb',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}