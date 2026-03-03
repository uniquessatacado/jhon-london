import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compressImage(file: File, maxSizeMB = 2, maxWidth = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file); // Retorna o arquivo original se já for pequeno o suficiente
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Não foi possível obter o contexto do canvas.'));
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Converte para Blob e depois para File
      ctx.canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          if (compressedFile.size > file.size) {
             // Se a compressão resultar em um arquivo maior (raro, mas possível com PNGs pequenos), retorna o original
             resolve(file);
          } else {
             toast.info(`Imagem "${file.name}" comprimida para melhor performance.`, {
                description: `Tamanho reduzido de ${(file.size / 1024 / 1024).toFixed(2)}MB para ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB.`
             });
             resolve(compressedFile);
          }
        } else {
          reject(new Error('Falha ao criar blob da imagem comprimida.'));
        }
      }, 'image/jpeg', 0.8); // Qualidade 0.8
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}