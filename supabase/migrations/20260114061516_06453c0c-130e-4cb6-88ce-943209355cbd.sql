-- Create sessions table for collaborative music sessions
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  producer_id TEXT NOT NULL,
  genre TEXT DEFAULT 'groove',
  bpm INTEGER DEFAULT 120,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clips table for audio submissions
CREATE TABLE public.clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('drums', 'bass', 'melody', 'vocals', 'fx', 'sample')),
  audio_url TEXT,
  waveform JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'voting' CHECK (status IN ('pending', 'voting', 'approved', 'rejected')),
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  ai_score INTEGER,
  submitted_by_id TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_avatar TEXT DEFAULT '🎧',
  section_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table to track user votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clip_id UUID REFERENCES public.clips(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clip_id, user_id)
);

-- Create sections table for session timeline
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bars INTEGER DEFAULT 8,
  position INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table to track session members
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT DEFAULT '🎧',
  role TEXT DEFAULT 'contributor' CHECK (role IN ('producer', 'contributor', 'listener')),
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (collaborative sessions are public)
CREATE POLICY "Sessions are viewable by everyone" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Clips are viewable by everyone" ON public.clips FOR SELECT USING (true);
CREATE POLICY "Votes are viewable by everyone" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Sections are viewable by everyone" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Participants are viewable by everyone" ON public.participants FOR SELECT USING (true);

-- Allow public insert for collaborative features (in production would require auth)
CREATE POLICY "Anyone can create sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit clips" ON public.clips FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can vote" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create sections" ON public.sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can join sessions" ON public.participants FOR INSERT WITH CHECK (true);

-- Allow updates
CREATE POLICY "Anyone can update sessions" ON public.sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can update clips" ON public.clips FOR UPDATE USING (true);
CREATE POLICY "Anyone can update sections" ON public.sections FOR UPDATE USING (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);

-- Allow deletes
CREATE POLICY "Anyone can delete clips" ON public.clips FOR DELETE USING (true);
CREATE POLICY "Anyone can delete sections" ON public.sections FOR DELETE USING (true);
CREATE POLICY "Anyone can delete votes" ON public.votes FOR DELETE USING (true);
CREATE POLICY "Anyone can leave sessions" ON public.participants FOR DELETE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;