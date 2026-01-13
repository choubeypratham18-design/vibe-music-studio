import { useState } from "react";
import { Upload, Music, Mic, Play, Pause, X, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export interface AudioClip {
  id: string;
  name: string;
  duration: number;
  submittedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  type: "drums" | "bass" | "melody" | "vocals" | "fx" | "sample";
  waveform: number[];
  status: "pending" | "voting" | "approved" | "rejected";
  votes: { up: number; down: number };
  timestamp: Date;
  aiScore?: number;
}

interface ClipSubmissionProps {
  onSubmitClip: (clip: AudioClip) => void;
  sessionSection: string;
  isProducer: boolean;
}

const clipTypes = [
  { id: "drums", label: "Drums", icon: "🥁", color: "ai-pink" },
  { id: "bass", label: "Bass", icon: "🎸", color: "ai-purple" },
  { id: "melody", label: "Melody", icon: "🎹", color: "ai-blue" },
  { id: "vocals", label: "Vocals", icon: "🎤", color: "ai-gold" },
  { id: "fx", label: "FX", icon: "✨", color: "ai-cyan" },
  { id: "sample", label: "Sample", icon: "📀", color: "primary" },
];

// Generate random waveform data
const generateWaveform = (): number[] => {
  return Array.from({ length: 40 }, () => Math.random() * 100);
};

export const ClipSubmission = ({ 
  onSubmitClip, 
  sessionSection,
  isProducer 
}: ClipSubmissionProps) => {
  const [selectedType, setSelectedType] = useState<string>("drums");
  const [clipName, setClipName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recordingTime > 0) {
        handleSubmit(recordingTime);
      }
      setRecordingTime(0);
    } else {
      // Start recording
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            clearInterval(interval);
            setIsRecording(false);
            handleSubmit(30);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          handleSubmit(Math.floor(Math.random() * 20) + 5);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = (duration: number) => {
    const name = clipName.trim() || `${clipTypes.find(t => t.id === selectedType)?.label} clip`;
    
    const newClip: AudioClip = {
      id: `clip-${Date.now()}`,
      name,
      duration,
      submittedBy: {
        id: isProducer ? "producer" : `user-${Date.now()}`,
        name: isProducer ? "Producer" : "You",
        avatar: isProducer ? "👑" : "🎧",
      },
      type: selectedType as AudioClip["type"],
      waveform: generateWaveform(),
      status: isProducer ? "approved" : "pending",
      votes: { up: 0, down: 0 },
      timestamp: new Date(),
      aiScore: Math.floor(Math.random() * 40) + 60,
    };

    onSubmitClip(newClip);
    setClipName("");
    toast.success("Clip submitted!", {
      description: isProducer 
        ? "Added directly to the session" 
        : "Waiting for voting and producer approval",
    });
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-ai-cyan" />
        <h2 className="font-display text-xs font-semibold tracking-wider text-ai-cyan">
          SUBMIT CLIP
        </h2>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-ai-purple/20 text-ai-purple">
          {sessionSection}
        </span>
      </div>

      {/* Clip Type Selection */}
      <div className="grid grid-cols-3 gap-2">
        {clipTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`
              flex flex-col items-center gap-1 p-2 rounded-lg transition-all
              ${selectedType === type.id 
                ? `bg-${type.color}/20 border-2 border-${type.color}/50` 
                : "bg-background/40 border border-border/30 hover:border-border/60"
              }
            `}
          >
            <span className="text-lg">{type.icon}</span>
            <span className="text-[10px] font-display">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Clip Name */}
      <Input
        value={clipName}
        onChange={(e) => setClipName(e.target.value)}
        placeholder="Name your clip (optional)"
        className="h-9 text-xs bg-background/50 border-border/50"
      />

      {/* Recording / Upload Controls */}
      <div className="flex gap-2">
        {/* Record Button */}
        <Button
          onClick={handleRecord}
          variant="outline"
          className={`
            flex-1 h-12 gap-2 transition-all
            ${isRecording 
              ? "bg-destructive/20 border-destructive text-destructive animate-pulse" 
              : "hover:bg-ai-pink/20 hover:border-ai-pink/50 hover:text-ai-pink"
            }
          `}
        >
          {isRecording ? (
            <>
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="font-mono">{recordingTime}s / 30s</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Record</span>
            </>
          )}
        </Button>

        {/* Upload Button */}
        <Button
          onClick={handleFileUpload}
          disabled={isUploading || isRecording}
          variant="outline"
          className="flex-1 h-12 gap-2 hover:bg-ai-cyan/20 hover:border-ai-cyan/50 hover:text-ai-cyan"
        >
          {isUploading ? (
            <div className="flex flex-col items-center w-full gap-1">
              <span className="text-xs">Uploading...</span>
              <Progress value={uploadProgress} className="h-1 w-full" />
            </div>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </>
          )}
        </Button>
      </div>

      {/* Quick Submit Hint */}
      <p className="text-[10px] text-muted-foreground text-center">
        {isProducer 
          ? "As producer, your clips are added directly" 
          : "Clips go to voting before producer approval"
        }
      </p>
    </div>
  );
};
