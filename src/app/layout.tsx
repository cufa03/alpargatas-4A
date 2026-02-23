import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Alpargatas 4A',
  description:
    'Catálogo mayorista de alpargatas. Sin precios online: consultá por WhatsApp para ventas al por mayor.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es'>
      <body className='min-h-dvh bg-background text-foreground antialiased'>
        <Navbar />
        <main className='mx-auto min-h-[calc(100dvh-64px)] max-w-6xl px-4 py-8'>
          {children}
        </main>
        <Footer />
        <Toaster richColors />
      </body>
    </html>
  );
}
