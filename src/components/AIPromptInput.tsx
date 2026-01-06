import { useState } from "react";
import { Wand2, Loader2, Sparkles, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AIPromptInputProps {
  onGenerate: (params: {
    harmony: number;
    rhythm: number;
    texture: number;
    atmosphere: number;
    piano: number;
    drums: number;
    bass: number;
    synth: number;
    genre: string;
  }) => void;
}

export const AIPromptInput = ({ onGenerate }: AIPromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const analyzePrompt = (text: string) => {
    const lower = text.toLowerCase();

    // Mood detection
    const happyKeywords = ["happy", "joyful", "upbeat", "cheerful", "bright", "sunny", "fun", "excited", "celebration"];
    const sadKeywords = ["sad", "melancholic", "emotional", "deep", "dark", "moody", "rain", "lonely", "heartbreak"];
    const energeticKeywords = ["energetic", "fast", "dance", "party", "club", "intense", "power", "explosive", "hype"];
    const calmKeywords = ["calm", "relaxing", "peaceful", "ambient", "chill", "soft", "gentle", "meditation", "sleep"];

    // Genre detection
    const electroKeywords = ["electronic", "synth", "edm", "techno", "house", "trance", "dubstep"];
    const acousticKeywords = ["acoustic", "organic", "natural", "folk", "classical"];
    const urbanKeywords = ["hip-hop", "rap", "urban", "trap", "beat", "808"];

    let mood = 50;
    let energy = 50;
    let texture = 50;

    // Analyze mood
    happyKeywords.forEach((k) => lower.includes(k) && (mood += 10));
    sadKeywords.forEach((k) => lower.includes(k) && (mood -= 10));

    // Analyze energy
    energeticKeywords.forEach((k) => lower.includes(k) && (energy += 15));
    calmKeywords.forEach((k) => lower.includes(k) && (energy -= 15));

    // Analyze texture
    electroKeywords.forEach((k) => lower.includes(k) && (texture += 15));
    acousticKeywords.forEach((k) => lower.includes(k) && (texture -= 15));

    // Clamp values
    mood = Math.max(0, Math.min(100, mood));
    energy = Math.max(0, Math.min(100, energy));
    texture = Math.max(0, Math.min(100, texture));

    // Determine genre
    let genre = "groove";
    if (energy < 40) genre = "roots";
    else if (energy > 70) genre = "future";

    // Calculate BPM based on energy
    const bpm = Math.round(70 + (energy / 100) * 80); // 70-150 BPM range

    return {
      harmony: mood,
      rhythm: bpm,
      texture: texture,
      atmosphere: 100 - energy,
      piano: mood > 50 ? 70 : 40,
      synth: texture > 50 ? 80 : 40,
      drums: energy,
      bass: 40 + (energy * 0.4),
      genre,
    };
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe the music you want to create");
      return;
    }

    setIsGenerating(true);
    toast.info("AI analyzing your prompt...", {
      description: "Generating unique music parameters",
    });

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const params = analyzePrompt(prompt);
    onGenerate(params);

    setIsGenerating(false);
    toast.success("Music generated from your prompt!", {
      description: `${params.genre.toUpperCase()} at ${params.rhythm} BPM`,
    });
  };

  const examplePrompts = [
    "Create a chill lo-fi beat for studying",
    "Energetic dance track with heavy bass",
    "Emotional piano melody with ambient pads",
    "Upbeat summer vibes with synth leads",
  ];

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-ai-purple" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
          AI MUSIC PROMPT
        </h3>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the music you want to create... (e.g., 'A dreamy ambient track with soft piano and ethereal synths')"
        className="min-h-[80px] bg-muted/50 border-border/50 resize-none text-sm placeholder:text-muted-foreground/50 focus:border-ai-purple focus:ring-ai-purple/20"
      />

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-1">
        {examplePrompts.slice(0, 2).map((example, i) => (
          <button
            key={i}
            onClick={() => setPrompt(example)}
            className="px-2 py-1 text-[9px] rounded-full bg-ai-purple/10 text-ai-purple/70 hover:bg-ai-purple/20 hover:text-ai-purple transition-colors truncate max-w-[150px]"
          >
            {example}
          </button>
        ))}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-10 bg-gradient-to-r from-ai-purple/20 to-ai-pink/20 border border-ai-purple/50 text-ai-purple hover:from-ai-purple/30 hover:to-ai-pink/30 hover:border-ai-purple font-display tracking-wider transition-all duration-300"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            GENERATING...
          </>
        ) : (
          <>
            <Music className="mr-2 h-4 w-4" />
            GENERATE FROM PROMPT
          </>
        )}
      </Button>
    </div>
  );
};
