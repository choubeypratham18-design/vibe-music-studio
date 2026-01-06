import { Brain, Radio, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const Header = ({ onMenuToggle, isMenuOpen }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2"
          onClick={onMenuToggle}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-ai-purple" />
          ) : (
            <Menu className="h-5 w-5 text-ai-purple" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-ai-purple" />
            <div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-ai-purple/50" />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-wider">
              <span className="ai-gradient-text">NOVA</span>
              <span className="text-foreground/80 text-sm sm:text-base ml-1">AI</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground tracking-widest hidden sm:block">
              GENERATIVE MUSIC STUDIO
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-ai-purple/30 bg-ai-purple/5">
          <Sparkles className="h-3 w-3 text-ai-purple" />
          <span className="text-[10px] font-display text-ai-purple">AI POWERED</span>
        </div>
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full border border-ai-pink/30 bg-ai-pink/5">
          <Radio className="h-3 w-3 text-ai-pink animate-pulse" />
          <span className="text-[10px] font-display text-ai-pink">LIVE</span>
        </div>
      </div>
    </header>
  );
};
