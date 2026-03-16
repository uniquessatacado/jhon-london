"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePdv } from '@/contexts/PdvContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, DollarSign, CreditCard, QrCode, Banknote } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { cart, customer, saleType, clearSale } = usePdv();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [discount, setDiscount] = useState<number | string>(0);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const finalTotal = Math.max(0, totalItems - (Number(discount) || 0));

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleCheckout = async () => {
    if (!customer || cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      // 1. Criar a Venda
      const { data: venda, error: vendaError } = await supabase.from('vendas').insert([{
        cliente_id: customer.id,
        usuario_id: user?.id,
        tipo_venda: saleType,
        valor_total: finalTotal,
        status: 'Concluído',
        origem: 'PDV',
        itens_count: cart.reduce((acc, item) => acc + item.quantity, 0),
      }]).select().single();

      if (vendaError) throw new Error(`Erro ao registrar venda: ${vendaError.message}`);

      // Log de criação
      await supabase.from('venda_historico').insert([{
        venda_id: venda.id,
        usuario_id: user?.id,
        usuario_nome: user?.nome,
        acao: 'Criação da Venda (PDV)',
        detalhes: { status: 'Concluído', valor: finalTotal }
      }]);

      // 2. Inserir os Itens da Venda
      const itens = cart.map(item => ({
        venda_id: venda.id,
        produto_id: item.productId,
        tamanho: item.variation.tamanho,
        quantidade: item.quantity,
        preco_unitario: item.unitPrice,
      }));

      const { error: itensError } = await supabase.from('venda_itens').insert(itens);
      if (itensError) throw new Error(`Erro ao registrar itens: ${itensError.message}`);

      // 3. Registrar o Pagamento
      await supabase.from('venda_pagamentos').insert([{ venda_id: venda.id, forma_pagamento: paymentMethod, valor: finalTotal }]);

      // 4. Abater Estoque
      for (const item of cart) {
        const { data: varData } = await supabase.from('produto_variacoes').select('id, estoque').eq('produto_id', item.productId).eq('tamanho', item.variation.tamanho).single();
        if (varData) {
          const novoEstoque = Math.max(0, Number(varData.estoque) - item.quantity);
          await supabase.from('produto_variacoes').update({ estoque: novoEstoque }).eq('id', varData.id);
        }
      }

      toast.success('Venda finalizada com sucesso!');
      clearSale();
      onOpenChange(false);
      setDiscount(0);
    } catch (error: any) {
      toast.error('Erro ao finalizar venda', { description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-950 border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/10 bg-white/5">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" /> Finalizar Venda
          </DialogTitle>
          <DialogDescription>Confirme os detalhes e a forma de pagamento.</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 shadow-inner">
             <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Cliente:</span><span className="font-medium text-white">{customer?.nome}</span></div>
             <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Itens:</span><span className="font-medium text-white">{cart.reduce((acc, item) => acc + item.quantity, 0)} unidades</span></div>
             <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Subtotal:</span><span className="font-mono text-white">{formatCurrency(totalItems)}</span></div>
             <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10"><span className="text-muted-foreground">Desconto (R$):</span><Input type="number" min="0" className="w-24 h-8 bg-black/60 border-white/10 text-right font-mono" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
             <div className="flex justify-between items-center pt-2 border-t border-white/10"><span className="text-lg font-bold text-emerald-400">Total a Pagar:</span><span className="text-2xl font-bold font-mono text-emerald-400">{formatCurrency(finalTotal)}</span></div>
          </div>
          <div className="space-y-3">
             <Label className="text-white">Forma de Pagamento</Label>
             <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" className={`h-14 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'pix' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-black/40 border-white/10 text-muted-foreground hover:bg-white/5'}`} onClick={() => setPaymentMethod('pix')}><QrCode className="h-5 w-5" /> PIX</Button>
                <Button type="button" variant="outline" className={`h-14 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'dinheiro' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-black/40 border-white/10 text-muted-foreground hover:bg-white/5'}`} onClick={() => setPaymentMethod('dinheiro')}><Banknote className="h-5 w-5" /> Dinheiro</Button>
                <Button type="button" variant="outline" className={`h-14 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'credito' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-black/40 border-white/10 text-muted-foreground hover:bg-white/5'}`} onClick={() => setPaymentMethod('credito')}><CreditCard className="h-5 w-5" /> Crédito</Button>
                <Button type="button" variant="outline" className={`h-14 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'debito' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-black/40 border-white/10 text-muted-foreground hover:bg-white/5'}`} onClick={() => setPaymentMethod('debito')}><CreditCard className="h-5 w-5" /> Débito</Button>
             </div>
          </div>
        </div>
        <DialogFooter className="p-4 border-t border-white/10 bg-black/20 gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isProcessing} className="hover:bg-white/5">Cancelar</Button>
          <Button onClick={handleCheckout} disabled={isProcessing} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold w-full sm:w-auto px-8 shadow-lg shadow-emerald-500/20">
             {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
             Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}