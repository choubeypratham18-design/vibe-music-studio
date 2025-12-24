import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MusicParameter } from "@/components/MusicParameter";
import { ParticleVisualization } from "@/components/ParticleVisualization";
import { LyricsInput } from "@/components/LyricsInput";
import { GenreSelector } from "@/components/GenreSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { GlobalTelepathy } from "@/components/GlobalTelepathy";
import { PlaybackControls } from "@/components/PlaybackControls";
import { toast } from "sonner";

const Index = () => {
  const [harmony, setHarmony] = useState(20);
  const [rhythm, setRhythm] = useState(77);
  const [texture, setTexture] = useState(12);
  const [atmosphere, setAtmosphere] = useState(40);
  const [lyrics, setLyrics] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("groove");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    toast.info("Reality Engine initializing...", {
      description: "Generating your unique vibe composition",
    });
    
    setTimeout(() => {
      setIsGenerating(false);
      setIsPlaying(true);
      toast.success("Vibe Generated!", {
        description: `${selectedGenre.toUpperCase()} track ready at ${rhythm} BPM`,
      });
    }, 3000);
  };

  const handleVocalizeOnly = () => {
    toast.info("Vocalization Mode", {
      description: "Generating vocals for your lyrics...",
    });
  };

  return (
    <div className="min-h-screen bg-background cyber-grid overflow-hidden">
      <Header />
      
      <main className="h-[calc(100vh-73px-88px)] flex">
        {/* Left Panel - Parameters */}
        <aside className="w-72 p-4 space-y-4 overflow-y-auto border-r border-border/30">
          <MusicParameter
            label="HARMONY"
            sublabel="Chord tension"
            value={harmony}
            onChange={setHarmony}
            variant="primary"
          />
          <MusicParameter
            label="RHYTHM"
            sublabel="Tempo & syncopation"
            value={rhythm}
            onChange={setRhythm}
            min={60}
            max={180}
            unit=" BPM"
            variant="accent"
          />
          <MusicParameter
            label="TEXTURE"
            sublabel="Acoustic ↔ Digital"
            value={texture}
            onChange={setTexture}
            variant="primary"
          />
          <MusicParameter
            label="ATMOSPHERE"
            sublabel="Reverb & Delay mix"
            value={atmosphere}
            onChange={setAtmosphere}
            variant="primary"
          />
        </aside>

        {/* Center - Visualization */}
        <section className="flex-1 p-4 particle-bg relative">
          <ParticleVisualization
            isPlaying={isPlaying}
            bpm={rhythm}
            harmony={harmony}
            rhythm={rhythm}
            texture={texture}
            atmosphere={atmosphere}
          />
        </section>

        {/* Right Panel - Controls */}
        <aside className="w-80 p-4 space-y-4 overflow-y-auto border-l border-border/30">
          <LyricsInput value={lyrics} onChange={setLyrics} />
          
          <GenerateButton
            onGenerate={handleGenerate}
            onVocalizeOnly={handleVocalizeOnly}
            isGenerating={isGenerating}
          />

          <GenreSelector
            selectedGenre={selectedGenre}
            onSelect={setSelectedGenre}
          />

          <GlobalTelepathy />
        </aside>
      </main>

      {/* Bottom - Playback */}
      <footer className="h-[88px] border-t border-border/30">
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          bpm={rhythm}
          currentTime={currentTime}
        />
      </footer>
    </div>
  );
};

export default Index;
