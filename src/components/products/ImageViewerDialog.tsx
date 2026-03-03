import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface ImageViewerDialogProps {
  imageUrl: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewerDialog({ imageUrl, open, onOpenChange }: ImageViewerDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-4xl w-full">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Visualização ampliada do produto"
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}