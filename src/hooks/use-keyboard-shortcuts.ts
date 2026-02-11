import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

// Global shortcuts registry
const globalShortcuts: ShortcutConfig[] = [];

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[] = []) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const allShortcuts = [...globalShortcuts, ...shortcuts];
    
    for (const shortcut of allShortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          // Allow Escape key even in inputs
          if (shortcut.key.toLowerCase() !== 'escape') {
            continue;
          }
        }
        
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook for navigation shortcuts
export const useNavigationShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'd',
      alt: true,
      action: () => navigate('/admin'),
      description: 'Go to Dashboard',
    },
    {
      key: 'e',
      alt: true,
      action: () => navigate('/admin/employees'),
      description: 'Go to Employees',
    },
    {
      key: 'p',
      alt: true,
      action: () => navigate('/admin/payroll'),
      description: 'Go to Payroll',
    },
    {
      key: 'r',
      alt: true,
      action: () => navigate('/admin/reports'),
      description: 'Go to Reports',
    },
    {
      key: 'm',
      alt: true,
      action: () => navigate('/admin/monitoring'),
      description: 'Go to Monitoring',
    },
    {
      key: 's',
      alt: true,
      action: () => navigate('/admin/settings'),
      description: 'Go to Settings',
    },
    {
      key: 'n',
      alt: true,
      action: () => navigate('/notifications'),
      description: 'Go to Notifications',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};

// Hook for common action shortcuts
export const useActionShortcuts = (actions: {
  onSearch?: () => void;
  onNew?: () => void;
  onExport?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onRefresh?: () => void;
}) => {
  const shortcuts: ShortcutConfig[] = [];

  if (actions.onSearch) {
    shortcuts.push({
      key: 'k',
      ctrl: true,
      action: actions.onSearch,
      description: 'Focus search',
    });
  }

  if (actions.onNew) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      action: actions.onNew,
      description: 'Create new item',
    });
  }

  if (actions.onExport) {
    shortcuts.push({
      key: 'e',
      ctrl: true,
      shift: true,
      action: actions.onExport,
      description: 'Export data',
    });
  }

  if (actions.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      action: actions.onSave,
      description: 'Save changes',
    });
  }

  if (actions.onCancel) {
    shortcuts.push({
      key: 'Escape',
      action: actions.onCancel,
      description: 'Cancel / Close dialog',
    });
  }

  if (actions.onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      shift: true,
      action: actions.onRefresh,
      description: 'Refresh data',
    });
  }

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};

// Get all available shortcuts for help display
export const getShortcutsList = (): { key: string; description: string }[] => [
  { key: 'Alt + D', description: 'Go to Dashboard' },
  { key: 'Alt + E', description: 'Go to Employees' },
  { key: 'Alt + P', description: 'Go to Payroll' },
  { key: 'Alt + R', description: 'Go to Reports' },
  { key: 'Alt + M', description: 'Go to Monitoring' },
  { key: 'Alt + S', description: 'Go to Settings' },
  { key: 'Alt + N', description: 'Go to Notifications' },
  { key: 'Ctrl + K', description: 'Focus search' },
  { key: 'Ctrl + N', description: 'Create new item' },
  { key: 'Ctrl + Shift + E', description: 'Export data' },
  { key: 'Ctrl + S', description: 'Save changes' },
  { key: 'Escape', description: 'Cancel / Close dialog' },
  { key: '?', description: 'Show keyboard shortcuts' },
];
