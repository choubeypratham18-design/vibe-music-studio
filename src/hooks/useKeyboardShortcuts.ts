import { useEffect, useCallback } from "react";

interface KeyboardShortcutsConfig {
  onPlayPause: () => void;
  onLockAll: () => void;
  onUnlockAll: () => void;
  onUndo: () => void;
  onToggleAB?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onPlayPause,
  onLockAll,
  onUnlockAll,
  onUndo,
  onToggleAB,
  enabled = true,
}: KeyboardShortcutsConfig) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          onPlayPause();
          break;
        case "KeyL":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            onLockAll();
          }
          break;
        case "KeyU":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            onUnlockAll();
          }
          break;
        case "KeyZ":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onUndo();
          }
          break;
        case "KeyA":
          if (event.shiftKey) {
            event.preventDefault();
            onToggleAB?.();
          }
          break;
      }
    },
    [enabled, onPlayPause, onLockAll, onUnlockAll, onUndo, onToggleAB]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

export const shortcutsList = [
  { key: "Space", action: "Play/Pause" },
  { key: "L", action: "Lock all parameters" },
  { key: "U", action: "Unlock all parameters" },
  { key: "Ctrl+Z", action: "Undo last change" },
  { key: "Shift+A", action: "Toggle A/B comparison" },
];
