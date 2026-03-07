import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSocket } from '@/context/SocketContext';

interface GuessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GuessDialog = ({ open, onOpenChange }: GuessDialogProps) => {
  const { room, guessCharacter } = useSocket();

  if (!room) return null;

  const handleGuess = (characterId: string) => {
    guessCharacter(characterId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Guess Your Opponent's Character</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {room.characters.map(c => (
            <button
              key={c.id}
              onClick={() => handleGuess(c.id)}
              className="rounded-xl border border-border overflow-hidden hover:border-primary hover:shadow-card transition-all"
            >
              <img src={c.imageUrl} alt={c.name} className="aspect-square w-full object-cover" />
              <div className="p-1.5 text-center">
                <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuessDialog;
