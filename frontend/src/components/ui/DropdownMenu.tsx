import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  separator?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function DropdownMenu({ trigger, items, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div className={cn(
          'absolute z-50 mt-1 w-48 rounded-xl bg-white dark:bg-neutral-800 shadow-lg border border-gray-200 dark:border-neutral-700 py-1 text-sm',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {item.separator && <div className="my-1 border-t border-gray-100 dark:border-neutral-700" />}
              <button
                onClick={() => { item.onClick(); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-left',
                  item.variant === 'danger' ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'
                )}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
