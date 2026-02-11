import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';
import { getShortcutsList } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsHelpProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const KeyboardShortcutsHelp = ({ open: controlledOpen, onOpenChange }: KeyboardShortcutsHelpProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // Listen for ? key to show help
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          event.preventDefault();
          handleOpenChange(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts = getShortcutsList();

  const navigationShortcuts = shortcuts.filter(s => s.key.startsWith('Alt'));
  const actionShortcuts = shortcuts.filter(s => !s.key.startsWith('Alt'));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Keyboard className="h-5 w-5 text-green-600" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation Shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Navigation</h3>
            <div className="grid grid-cols-1 gap-2">
              {navigationShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs dark:border-gray-600 dark:text-gray-300">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              {actionShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs dark:border-gray-600 dark:text-gray-300">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> anytime to show this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;
