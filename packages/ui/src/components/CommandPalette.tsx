import { useEffect, useState, useRef } from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ items, open, onOpenChange }: CommandPaletteProps) {
  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Group items
  const groups = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const group = item.group || 'Actions';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 flex items-start justify-center pt-[20vh]">
            <motion.div
              className="w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.12 }}
            >
              <Command
                className="rounded-lg border border-border bg-surface-1 shadow-2xl overflow-hidden"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onOpenChange(false);
                }}
              >
                <div className="flex items-center border-b border-border px-3">
                  <Search className="h-4 w-4 text-text-muted mr-2 shrink-0" />
                  <Command.Input
                    placeholder="Search pages, actions..."
                    className="flex h-10 w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                    autoFocus
                  />
                  <kbd className="ml-2 shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-2xs text-text-muted font-mono">
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-72 overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-text-muted">
                    No results found.
                  </Command.Empty>

                  {Object.entries(groups).map(([group, groupItems]) => (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                    >
                      {groupItems.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.label}
                          onSelect={() => {
                            item.onSelect();
                            onOpenChange(false);
                          }}
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-text-primary cursor-pointer aria-selected:bg-brand-50 aria-selected:text-brand-700 dark:aria-selected:bg-brand-950 dark:aria-selected:text-brand-300"
                        >
                          {item.icon && (
                            <span className="shrink-0 text-text-muted">{item.icon}</span>
                          )}
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut && (
                            <kbd className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-2xs text-text-muted font-mono">
                              {item.shortcut}
                            </kbd>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>
              </Command>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
