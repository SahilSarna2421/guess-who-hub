import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw } from 'lucide-react';

const GameOverPage = () => {
  const { room, playerId, rematch } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!room) { navigate('/'); return; }
    if (room.phase === 'lobby') navigate('/lobby');
    if (room.phase === 'character-selection') navigate('/select');
  }, [room, navigate]);

  if (!room) return null;

  const winner = room.players.find(p => p.id === room.winnerId);
  const isWinner = room.winnerId === playerId;
  const correctChar = room.characters.find(c => c.id === room.correctCharacter);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--gradient-surface)' }}>
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-6">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${isWinner ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <Trophy className={`h-10 w-10 ${isWinner ? 'text-success' : 'text-destructive'}`} />
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {isWinner ? 'You Won! 🎉' : 'You Lost!'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {winner?.name} guessed correctly!
            </p>
          </div>

          {correctChar && (
            <div className="inline-block rounded-xl border border-border overflow-hidden shadow-card">
              <img src={correctChar.imageUrl} alt={correctChar.name} className="h-32 w-32 object-cover" />
              <div className="p-2">
                <p className="text-sm font-semibold text-foreground">{correctChar.name}</p>
              </div>
            </div>
          )}

          <Button onClick={rematch} className="w-full h-11 gradient-primary text-primary-foreground font-semibold">
            <RotateCcw className="mr-2 h-4 w-4" /> Rematch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverPage;
