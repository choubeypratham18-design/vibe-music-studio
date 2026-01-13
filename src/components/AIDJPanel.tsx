import { useState, useEffect } from "react";
import { Sparkles, Zap, Music, TrendingUp, Lightbulb, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AudioClip } from "./ClipSubmission";

interface AISuggestion {
  id: string;
  type: "clip_recommendation" | "arrangement" | "mix_tip" | "genre_insight";
  title: string;
  description: string;
  confidence: number;
  action?: {
    label: string;
    clipId?: string;
    sectionId?: string;
  };
}

interface AIDJPanelProps {
  clips: AudioClip[];
  currentSection: string;
  genre: string;
  bpm: number;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  isProducer: boolean;
}

const suggestionIcons = {
  clip_recommendation: Sparkles,
  arrangement: Music,
  mix_tip: TrendingUp,
  genre_insight: Lightbulb,
};

const suggestionColors = {
  clip_recommendation: "ai-cyan",
  arrangement: "ai-purple",
  mix_tip: "ai-gold",
  genre_insight: "ai-pink",
};

export const AIDJPanel = ({
  clips,
  currentSection,
  genre,
  bpm,
  onApplySuggestion,
  isProducer,
}: AIDJPanelProps) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Generate AI suggestions based on current state
  useEffect(() => {
    generateSuggestions();
  }, [clips.length, currentSection, genre]);

  const generateSuggestions = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 0;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(() => {
      const newSuggestions: AISuggestion[] = [];

      // Analyze submitted clips and suggest best ones
      const topClips = [...clips]
        .filter(c => c.status === "voting" || c.status === "pending")
        .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
        .slice(0, 2);

      topClips.forEach((clip) => {
        newSuggestions.push({
          id: `suggestion-${clip.id}`,
          type: "clip_recommendation",
          title: `Use "${clip.name}"`,
          description: `AI analysis shows this ${clip.type} clip has strong ${genre} characteristics with ${clip.aiScore}% match score. Consider adding to ${currentSection}.`,
          confidence: clip.aiScore || 75,
          action: {
            label: "Approve Clip",
            clipId: clip.id,
            sectionId: currentSection,
          },
        });
      });

      // Genre-based arrangement suggestions
      const arrangementSuggestions = [
        {
          title: "Add a build-up",
          description: `For ${genre}, consider adding tension before the ${currentSection === "chorus" ? "drop" : "chorus"} with a filter sweep.`,
        },
        {
          title: "Layer more percussion",
          description: `Current ${currentSection} could benefit from additional hi-hats or shakers to increase energy.`,
        },
        {
          title: "Create contrast",
          description: `The ${currentSection} section needs more dynamic variation. Try reducing elements before bringing them back.`,
        },
      ];

      newSuggestions.push({
        id: `arrangement-${Date.now()}`,
        type: "arrangement",
        ...arrangementSuggestions[Math.floor(Math.random() * arrangementSuggestions.length)],
        confidence: Math.floor(Math.random() * 20) + 70,
      });

      // BPM-based mixing tips
      if (bpm > 140) {
        newSuggestions.push({
          id: `mix-tip-${Date.now()}`,
          type: "mix_tip",
          title: "High-energy optimization",
          description: `At ${bpm} BPM, keep the sub-bass tight and punchy. Consider sidechain compression for that pumping effect.`,
          confidence: 85,
        });
      } else if (bpm < 90) {
        newSuggestions.push({
          id: `mix-tip-${Date.now()}`,
          type: "mix_tip",
          title: "Groove enhancement",
          description: `At ${bpm} BPM, let the bass breathe with longer decay. Add subtle swing to the drums for groove.`,
          confidence: 82,
        });
      }

      // Genre insights
      const genreInsights: Record<string, AISuggestion> = {
        groove: {
          id: `genre-${Date.now()}`,
          type: "genre_insight",
          title: "Groove Essentials",
          description: "Funky basslines and off-beat hi-hats are key. Consider adding a classic funk guitar stab.",
          confidence: 88,
        },
        chill: {
          id: `genre-${Date.now()}`,
          type: "genre_insight",
          title: "Chill Vibes",
          description: "Soft pads and vinyl crackle add warmth. Keep the mix spacious with generous reverb.",
          confidence: 86,
        },
        hype: {
          id: `genre-${Date.now()}`,
          type: "genre_insight",
          title: "Hype Energy",
          description: "Build tension with risers. Use hard-hitting kicks and aggressive synths for maximum impact.",
          confidence: 90,
        },
        ambient: {
          id: `genre-${Date.now()}`,
          type: "genre_insight",
          title: "Ambient Textures",
          description: "Layer evolving pads with granular textures. Let silence be part of the composition.",
          confidence: 84,
        },
      };

      if (genreInsights[genre]) {
        newSuggestions.push(genreInsights[genre]);
      }

      setSuggestions(newSuggestions.slice(0, 4));
    }, 1000);
  };

  const handleApprove = (suggestion: AISuggestion) => {
    onApplySuggestion(suggestion);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    toast.success("Suggestion applied!", {
      description: suggestion.title,
    });
  };

  const handleDismiss = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    toast.info("Suggestion dismissed");
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-cyan" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-cyan">
            AI DJ CO-PILOT
          </h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={generateSuggestions}
          disabled={isAnalyzing}
          className="h-6 px-2 text-[10px] hover:bg-ai-cyan/20"
        >
          <Zap className="w-3 h-3 mr-1" />
          Analyze
        </Button>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ai-cyan animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Analyzing session...</span>
          </div>
          <Progress value={analysisProgress} className="h-1" />
        </div>
      )}

      {/* Suggestions List */}
      {!isAnalyzing && suggestions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">AI is ready to assist</p>
          <p className="text-[10px] mt-1">Add clips or change settings to get suggestions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const Icon = suggestionIcons[suggestion.type];
            const color = suggestionColors[suggestion.type];

            return (
              <div
                key={suggestion.id}
                className={`
                  bg-background/40 rounded-lg p-3 border transition-all
                  border-${color}/30 hover:border-${color}/50
                `}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg bg-${color}/20`}>
                    <Icon className={`w-4 h-4 text-${color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-xs font-semibold">
                        {suggestion.title}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded bg-${color}/20 text-${color}`}>
                        {suggestion.confidence}% match
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isProducer && suggestion.action && (
                  <div className="flex gap-2 mt-3 pl-8">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(suggestion)}
                      className="flex-1 h-7 text-[10px] bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {suggestion.action.label}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDismiss(suggestion.id)}
                      className="h-7 px-3 text-[10px] bg-muted/20 hover:bg-muted/30 text-muted-foreground border border-border/30"
                    >
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* Non-actionable suggestions for non-producers */}
                {!isProducer && (
                  <div className="mt-2 pl-8">
                    <span className="text-[10px] text-muted-foreground italic">
                      Producer will review this suggestion
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Status */}
      <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-ai-cyan/10 border border-ai-cyan/20">
        <Sparkles className="w-3 h-3 text-ai-cyan" />
        <span className="text-[10px] text-ai-cyan">
          AI learns from crowd votes to improve suggestions
        </span>
      </div>
    </div>
  );
};
