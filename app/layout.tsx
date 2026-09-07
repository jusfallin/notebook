import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DEKA NOTEBOOK',
  description: 'A private little notebook for two hearts.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
