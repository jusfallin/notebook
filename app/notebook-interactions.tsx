'use client';

import { useEffect } from 'react';

export default function NotebookInteractions() {
  useEffect(() => {
    const onEditMemory = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('.love-button');
      if (!button) return;

      // The old reader control always opened page 00 because enterStudio()
      // ignored its entry index. Route the click to the matching Writing Desk
      // item after switching modes so the exact memory stays selected.
      event.preventDefault();
      event.stopPropagation();

      const paper = document.querySelector('.book-stage .paper-base');
      const date = paper?.querySelector('.date-display')?.textContent?.trim() || '';
      const firstPage = paper?.querySelector('.dedication-page');
      const writingDesk = document.querySelector('.mode-switch button:nth-child(2)') as HTMLButtonElement | null;
      if (!writingDesk) return;

      writingDesk.click();

      window.setTimeout(() => {
        const selector = firstPage ? '.opening-page-item' : '.studio-page-item';
        const items = Array.from(document.querySelectorAll(selector));
        const match = firstPage
          ? items[0]
          : items.find(item => item.querySelector('strong')?.textContent?.trim() === date);
        (match as HTMLButtonElement | undefined)?.click();
      }, 90);
    };

    document.addEventListener('click', onEditMemory, true);
    return () => document.removeEventListener('click', onEditMemory, true);
  }, []);

  return null;
}
