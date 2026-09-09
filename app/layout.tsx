import type { Metadata } from 'next';
import './globals.css';
import './notebook-overrides.css';
import './notebook-polish.css';
import './cover.css';
import './love-redesign.css';
import './opening-page.css';
import './preview-mode.css';
import './preview-love-note.css';
import './first-page.css';
import './romance-interactions.css';
import './love-atmosphere.css';
import './toolbar-guide.css';
import './mode-home-redesign.css';
import './mode-home-mobile.css';
import './refinement.css';
import './touch-transition.css';
import ConfirmProvider from './confirm-provider';

export const metadata: Metadata = {
  title: 'DEKA NOTEBOOK',
  description: 'A private little notebook for two hearts.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ConfirmProvider />{children}</body></html>;
}
