'use client';

import { useEffect } from 'react';

export default function ConfirmProvider() {
  useEffect(() => {
    let bypass = false;
    let activeButton: HTMLElement | null = null;

    const close = (confirmed: boolean) => {
      const modal = document.querySelector<HTMLElement>('[data-notebook-confirm]');
      if (!modal) return;
      modal.remove();
      if (confirmed && activeButton) {
        const originalConfirm = window.confirm;
        window.confirm = () => true;
        bypass = true;
        activeButton.click();
        bypass = false;
        window.confirm = originalConfirm;
      }
      activeButton = null;
    };

    const open = (button: HTMLElement) => {
      if (document.querySelector('[data-notebook-confirm]')) return;
      activeButton = button;
      const row = button.closest('.index-row');
      const date = row?.querySelector('.index-item span')?.textContent?.trim() || document.querySelector('.date-display')?.textContent?.trim() || 'this memory';
      const modal = document.createElement('div');
      modal.dataset.notebookConfirm = 'true';
      modal.className = 'notebook-confirm-backdrop';
      modal.innerHTML = `<div class="notebook-confirm" role="dialog" aria-modal="true" aria-labelledby="notebook-confirm-title"><div class="notebook-confirm-icon">♡</div><div class="notebook-confirm-kicker">A LITTLE DECISION</div><h2 id="notebook-confirm-title">Remove this memory?</h2><p>Are you sure you want to remove the page dated <strong>${date.replace(/[<>]/g, '')}</strong>?</p><div class="notebook-confirm-actions"><button type="button" data-confirm-cancel>Keep page</button><button type="button" data-confirm-ok>Remove page</button></div></div>`;
      document.body.appendChild(modal);
      modal.querySelector<HTMLElement>('[data-confirm-cancel]')?.focus();
      modal.addEventListener('click', (event) => { if (event.target === modal) close(false); });
      modal.querySelector('[data-confirm-cancel]')?.addEventListener('click', () => close(false));
      modal.querySelector('[data-confirm-ok]')?.addEventListener('click', () => close(true));
    };

    const onClick = (event: MouseEvent) => {
      if (bypass) return;
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>('.delete-page, .index-delete');
      if (!button || button.hasAttribute('disabled')) return;
      event.preventDefault();
      event.stopPropagation();
      open(button);
    };

    document.addEventListener('click', onClick, true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.querySelector('[data-notebook-confirm]')) close(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey);
      document.querySelector('[data-notebook-confirm]')?.remove();
    };
  }, []);

  return null;
}
