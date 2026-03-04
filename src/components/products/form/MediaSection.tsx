import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Box, Image as ImageIcon, Video, Upload, X, Grid as GridIcon } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import { toast } from 'sonner';

interface MediaSectionProps {
  mainImagePreview: string | null;
  setMainImagePreview: (v: string | null) => void;
  setMainImageFile: (v: File | null) => void;
  galleryPreviews: string[];
  setGalleryPreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setGalleryFiles: React.Dispatch<React.SetStateAction<File[]>>;
  existingGallery: string[];
  videoPreview: string | null;
  setVideoPreview: (v: string | null) => void;
  setVideoFile: (v: File | null) => void;
}

export function MediaSection({ 
  mainImagePreview, setMainImagePreview, setMainImageFile, 
  galleryPreviews, setGalleryPreviews, setGalleryFiles, existingGallery, 
  videoPreview, setVideoPreview, setVideoFile 
}: MediaSectionProps) {
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setFile: Function, setPreview: Function, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'image') {
      try {
        const compressedFile = await compressImage(file, 2, 1200);
        setFile(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
      } catch (error) { toast.error("Falha ao comprimir imagem."); }
    } else {
      if (file.size > 50 * 1024 * 1024) return toast.error(`Vídeo muito grande. Máximo 50MB.`);
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (galleryPreviews.length + files.length > 5) return toast.error("Limite máximo de 5 imagens na galeria.");
    const compressionPromises = files.map(file => file.size > 2 * 1024 * 1024 ? compressImage(file, 2, 1200) : Promise.resolve(file));
    try {
      const compressedFiles = await Promise.all(compressionPromises);
      setGalleryFiles(prev => [...prev, ...compressedFiles]);
      setGalleryPreviews(prev => [...prev, ...compressedFiles.map(f => URL.createObjectURL(f))]);
    } catch (error) { toast.error("Erro ao processar imagens da galeria."); }
  };

  const removeGalleryImage = (index: number) => {
    const itemToRemove = galleryPreviews[index];
    const isOldImage = existingGallery.includes(itemToRemove);
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    if (!isOldImage) {
      const numExisting = galleryPreviews.filter(p => existingGallery.includes(p)).length;
      if (index >= numExisting) setGalleryFiles(prev => prev.filter((_, i) => i !== (index - numExisting)));
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 shadow-lg">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-base flex items-center gap-2 text-white">
          <Box className="h-4 w-4 text-emerald-500" /> 4. Mídia e Arquivos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-emerald-400" /> Imagem Principal</Label>
          <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/5 ${mainImagePreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`} onClick={() => mainImageInputRef.current?.click()}>
            <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setMainImageFile, setMainImagePreview, 'image')} />
            {mainImagePreview ? (
              <div className="relative group w-full h-48">
                <img src={mainImagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <span className="text-white font-medium flex items-center"><Upload className="mr-2 h-4 w-4" /> Trocar</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Clique para enviar</p>
                <p className="text-[10px] opacity-70">Max 2MB (comprimido)</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="flex items-center gap-2"><GridIcon className="h-4 w-4 text-emerald-400" /> Galeria (Até 5)</Label>
            <span className="text-xs text-muted-foreground">{galleryPreviews.length}/5</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {galleryPreviews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                <img src={preview} alt={`Galeria ${idx}`} className="w-full h-full object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(idx)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {galleryPreviews.length < 5 && (
              <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5" onClick={() => galleryInputRef.current?.click()}>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Adicionar</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label className="flex items-center gap-2"><Video className="h-4 w-4 text-emerald-400" /> Vídeo do Produto</Label>
          <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${videoPreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`}>
            <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, setVideoFile, setVideoPreview, 'video')} />
            {videoPreview ? (
              <div className="relative group w-full aspect-video max-w-md mx-auto">
                <video src={videoPreview} controls className="w-full h-full object-contain rounded-lg" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                  <span className="text-white font-medium flex items-center"><Upload className="mr-2 h-4 w-4" /> Trocar Vídeo</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Clique para enviar</p>
                <p className="text-[10px] opacity-70">Max 50MB</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}