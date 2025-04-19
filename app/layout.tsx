import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { KindeProvider } from '@/components/kinde-provider';
import { Navbar } from '@/components/navbar';
import { UserHistoryProvider } from '@/context/user-history-context';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Questões do ENEM | Banco de Questões Gratuito e Ilimitado',
  description:
    'Acesse milhares de questões do ENEM totalmente GRÁTIS e sem limite de uso. Banco completo de questões de provas anteriores do ENEM para estudar online sem pagar nada.',
  keywords:
    'ENEM, vestibular, questões ENEM, provas anteriores, estudo ENEM, simulado ENEM, exercícios ENEM, preparação vestibular, questões resolvidas, banco de questões grátis, ENEM gratuito, exercícios grátis, questões ilimitadas, estudo gratuito, sem pagar',
  authors: [{ name: 'Questões ENEM' }],
  creator: 'Questões ENEM',
  publisher: 'Questões ENEM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Questões do ENEM | Banco de Questões 100% Gratuito e Ilimitado',
    description:
      'Acesse questões de provas anteriores do ENEM totalmente GRÁTIS e sem limite de uso. Estude online sem pagar nada, sem restrições e sem cadastro obrigatório.',
    url: '/',
    siteName: 'Questões ENEM',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Questões do ENEM | Banco de Questões 100% Gratuito e Ilimitado',
    description:
      'Acesse questões do ENEM totalmente grátis e sem limite de uso. Estude sem pagar nada.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="google-site-verification"
          content="lluNRXiTqwh48wzCKzI0aKOYP26U4-XluU2mMElAc6Y"
        />
      </head>
      <body className={inter.className}>
        <KindeProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserHistoryProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
            </UserHistoryProvider>
          </ThemeProvider>
        </KindeProvider>
        <Analytics />
      </body>
    </html>
  );
}
