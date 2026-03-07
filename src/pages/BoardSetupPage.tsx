import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Search, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

const BoardSetupPage = () => {
  const { room, playerId, addCharacter, removeCharacter, finishSetup } = useSocket();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searching, setSearching] = useState(false);

  const isHost = room?.players.find(p => p.id === playerId)?.isHost ?? false;

  useEffect(() => {
    if (!room) { navigate('/'); return; }
    if (room.phase === 'character-selection') navigate('/select');
    if (room.phase === 'playing') navigate('/game');
  }, [room, navigate]);

  const fetchCelebrityImage = async (query: string) => {
    setSearching(true);
    try {
      const res = await fetch(
        `${WIKI_API}?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=300&origin=*`
      );
      const data = await res.json();
      const pages = data.query?.pages;
      const page = pages ? Object.values(pages)[0] as any : null;
      if (page?.thumbnail?.source) {
        setImageUrl(page.thumbnail.source);
        toast.success('Image found!');
      } else {
        toast.info('No image found. You can add a URL manually.');
      }
    } catch {
      toast.error('Failed to search for image');
    }
    setSearching(false);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    const finalImage = imageUrl.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;
    addCharacter(name.trim(), finalImage);
    setName('');
    setImageUrl('');
  };

  if (!room) return null;

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--gradient-surface)' }}>
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">Board Setup</h2>
          <p className="mt-1 text-muted-foreground">Add characters to the game board ({room.characters.length} added)</p>
        </div>

        {isHost && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Character name" value={name} onChange={e => setName(e.target.value)} className="h-10" />
              <Button variant="outline" size="sm" className="h-10 px-3" onClick={() => name && fetchCelebrityImage(name)} disabled={!name || searching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Input placeholder="Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="h-10" />
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!name.trim()} className="gradient-primary text-primary-foreground">
                <Plus className="mr-1 h-4 w-4" /> Add Character
              </Button>
              {room.characters.length >= 4 && (
                <Button onClick={finishSetup} variant="outline" className="ml-auto">
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {!isHost && (
          <p className="mb-6 text-center text-sm text-muted-foreground">The host is setting up the board...</p>
        )}

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {room.characters.map(c => (
            <div key={c.id} className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-card">
              <img src={c.imageUrl} alt={c.name} className="aspect-square w-full object-cover" />
              <div className="p-2 text-center">
                <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
              </div>
              {isHost && (
                <button
                  onClick={() => removeCharacter(c.id)}
                  className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardSetupPage;
