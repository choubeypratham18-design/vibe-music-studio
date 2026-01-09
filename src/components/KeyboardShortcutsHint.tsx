import { useState } from "react";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortcutsList } from "@/hooks/useKeyboardShortcuts";

export const KeyboardShortcutsHint = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:border-ai-purple/50"
        title="Show keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 glass-panel p-3 space-y-2 animate-in slide-in-from-right-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-ai-cyan" />
          <span className="font-display text-xs text-ai-cyan">SHORTCUTS</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="h-5 w-5 p-0 hover:bg-muted/50"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-1">
        {shortcutsList.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center justify-between gap-4">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-background/60 rounded border border-border/50 text-foreground">
              {shortcut.key}
            </kbd>
            <span className="text-[10px] text-muted-foreground">{shortcut.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
