import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
    const { user, updateUser } = useAuth();
    const { register, handleSubmit, reset } = useForm();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user && open) {
            reset({
                nome: user.nome,
                email: user.email,
                whatsapp: user.whatsapp || '',
            });
        }
    }, [user, open, reset]);

    const onSubmit = async (data: any) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const payload: any = { 
              nome: data.nome,
              email: data.email,
              whatsapp: data.whatsapp 
            };
            if (data.senha) {
                payload.senha_hash = data.senha;
            }
            
            const { data: updatedUser, error } = await supabase.from('usuarios').update(payload).eq('id', user.id).select().single();
            if (error) throw error;
            
            updateUser({ ...user, ...updatedUser });
            toast.success('Perfil atualizado com sucesso!');
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Erro ao atualizar', { description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Meu Perfil</DialogTitle>
                    <DialogDescription>Atualize suas informações de acesso.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2"><Label>Nome</Label><Input {...register('nome', { required: true })} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input {...register('email', { required: true })} type="email" /></div>
                    <div className="space-y-2"><Label>WhatsApp</Label><Input {...register('whatsapp')} /></div>
                    <div className="space-y-2"><Label>Nova Senha (Opcional)</Label><Input {...register('senha')} type="password" placeholder="Deixe em branco para manter" /></div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}