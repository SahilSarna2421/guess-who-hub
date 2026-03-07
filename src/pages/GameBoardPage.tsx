import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import GuessDialog from '@/components/GuessDialog';

const GameBoardPage = () => {
  const { room, playerId, eliminateCharacter, restoreCharacter } = useSocket();
  const navigate = useNavigate();
  const [guessOpen, setGuessOpen] = useState(false);

  const currentPlayer = room?.players.find(p => p.id === playerId);

  useEffect(() => {
    if (!room) { navigate('/'); return; }
    if (room.phase === 'game-over') navigate('/gameover');
  }, [room, navigate]);

  if (!room || !currentPlayer) return null;

  const eliminated = new Set(currentPlayer.eliminatedCharacters);

  const toggleEliminate = (id: string) => {
    if (eliminated.has(id)) {
      restoreCharacter(id);
    } else {
      eliminateCharacter(id);
    }
  };

  return (
    <div className="min-h-screen py-6" style={{ background: 'var(--gradient-surface)' }}>
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Game Board</h2>
            <p className="text-sm text-muted-foreground">Click characters to eliminate them</p>
          </div>
          <Button onClick={() => setGuessOpen(true)} className="gradient-primary text-primary-foreground font-semibold">
            <HelpCircle className="mr-2 h-4 w-4" /> Guess Character
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {room.characters.map(c => {
            const isEliminated = eliminated.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleEliminate(c.id)}
                className={`relative rounded-xl border overflow-hidden transition-all ${
                  isEliminated
                    ? 'border-eliminated opacity-40 grayscale'
                    : 'border-border hover:border-primary/40 hover:shadow-card'
                }`}
              >
                <img src={c.imageUrl} alt={c.name} className="aspect-square w-full object-cover" />
                <div className="p-1.5 text-center">
                  <p className={`text-xs font-medium truncate ${isEliminated ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {c.name}
                  </p>
                </div>
                {isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-3/4 rotate-45 bg-destructive/60 rounded" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <GuessDialog open={guessOpen} onOpenChange={setGuessOpen} />
      </div>
    </div>
  );
};

export default GameBoardPage;
