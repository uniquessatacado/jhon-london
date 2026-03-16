import { useParams, useNavigate } from 'react-router-dom';
import { useSaleFullDetails } from '@/hooks/use-sale-details';
import { useSaleStatuses } from '@/hooks/use-sale-statuses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Package, User, CalendarClock, CreditCard, History, MessageCircle, MapPin, ExternalLink, QrCode, Banknote } from 'lucide-react';
import { mediaBaseUrl } from '@/lib/api';
import { useState } from 'react';
import { UpdateSaleStatusDialog } from '@/components/sales/UpdateSaleStatusDialog';
import { SaleWithDetails } from '@/hooks/use-sales';

export function SaleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sale, isLoading, isError } = useSaleFullDetails(id);
  const { data: statuses } = useSaleStatuses();
  
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${mediaBaseUrl}${imagePath}`;
  };

  const openWhatsApp = (phone: string | undefined, nomeCliente: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${nomeCliente}, tudo bem? Aqui é da John London e estou entrando em contato sobre o seu pedido #${id}.`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[80vh]"><Loader2 className="h-12 w-12 animate-spin text-emerald-500" /></div>;
  }

  if (isError || !sale) {
    return <div className="flex flex-col items-center justify-center h-[80vh] text-center gap-4"><p className="text-xl text-muted-foreground">Pedido não encontrado.</p><Button onClick={() => navigate('/vendas')} variant="outline">Voltar para Vendas</Button></div>;
  }

  const currentStatusObj = statuses?.find(s => s.label === sale.status);
  const statusColorClass = currentStatusObj 
    ? `bg-${currentStatusObj.color}-500/20 text-${currentStatusObj.color}-600 dark:text-${currentStatusObj.color}-400 border-${currentStatusObj.color}-500/30` 
    : 'bg-muted text-muted-foreground';

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
        case 'pix': return <QrCode className="h-4 w-4" />;
        case 'dinheiro': return <Banknote className="h-4 w-4" />;
        default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const saleForModal: SaleWithDetails = { ...sale } as any;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vendas')} className="h-10 w-10 rounded-full hover:bg-muted shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Pedido #{sale.id}</h1>
                <Badge variant="outline" className={`cursor-pointer px-3 py-1 text-sm border hover:opacity-80 transition-opacity ${statusColorClass}`} onClick={() => setIsStatusDialogOpen(true)}>
                    {sale.status}
                </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                <CalendarClock className="h-4 w-4" /> {formatDateTime(sale.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Badge variant="secondary" className="px-4 py-2 text-sm uppercase tracking-wider">{sale.origem || 'SISTEMA'}</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm uppercase tracking-wider bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">{sale.tipo_venda.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Produtos */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5 text-emerald-500" /> Produtos Comprados ({sale.itens_count})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y border-t-0">
                        {sale.venda_itens && sale.venda_itens.length > 0 ? (
                            sale.venda_itens.map((item) => {
                                const img = getImageUrl(item.produtos?.imagem_principal);
                                return (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-muted/20 transition-colors">
                                        <div className="h-20 w-20 shrink-0 bg-muted rounded-xl border overflow-hidden flex items-center justify-center">
                                            {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <Package className="h-8 w-8 text-muted-foreground/50" />}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-foreground text-base leading-tight">{item.produtos?.nome || `Produto Local #${item.produto_id}`}</h4>
                                                <p className="text-xs text-muted-foreground mt-1">Tam: <span className="font-bold text-foreground">{item.tamanho || 'N/A'}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col justify-between items-end text-right mt-2 sm:mt-0">
                                            <p className="text-sm text-muted-foreground">{item.quantidade}x {formatCurrency(item.preco_unitario)}</p>
                                            <p className="font-bold text-lg text-emerald-500">{formatCurrency(item.quantidade * item.preco_unitario)}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 flex flex-col items-center justify-center text-center text-muted-foreground">
                                <Package className="h-12 w-12 mb-3 opacity-20" />
                                <p className="font-medium">Os itens deste pedido não foram encontrados.</p>
                                <p className="text-sm mt-1 opacity-70">Pode ter havido uma falha durante o salvamento dos itens no PDV.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* HISTÓRICO / TIMELINE */}
            <Card className="bg-card shadow-sm">
                 <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg"><History className="h-5 w-5 text-blue-500" /> Linha do Tempo</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                        {sale.venda_historico?.map((log) => (
                            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                    <History className="h-4 w-4" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-background shadow-sm">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-foreground">{log.acao}</div>
                                        <time className="text-xs font-mono text-muted-foreground">{new Date(log.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</time>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Por <span className="font-medium text-foreground">{log.usuario_nome || 'Sistema'}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2 opacity-70">
                                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!sale.venda_historico || sale.venda_historico.length === 0) && (
                            <p className="text-center text-muted-foreground text-sm">Nenhum histórico registrado.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* COLUNA DIREITA: Cliente e Financeiro */}
        <div className="space-y-6">
            
            {/* RESUMO FINANCEIRO */}
            <Card className="bg-card shadow-sm border-emerald-500/20 overflow-hidden">
                <div className="bg-emerald-500/10 p-6 flex flex-col items-center justify-center border-b border-emerald-500/20">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Valor Total</span>
                    <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(sale.valor_total)}</span>
                </div>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2"><CreditCard className="h-5 w-5 text-muted-foreground" /> <span className="font-bold">Pagamentos</span></div>
                    {sale.venda_pagamentos?.map(pg => (
                        <div key={pg.id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-2 text-foreground capitalize font-medium">
                                {getPaymentIcon(pg.forma_pagamento)} {pg.forma_pagamento}
                            </div>
                            <span className="font-mono">{formatCurrency(pg.valor)}</span>
                        </div>
                    ))}
                    {(!sale.venda_pagamentos || sale.venda_pagamentos.length === 0) && (
                         <div className="text-sm text-muted-foreground text-center py-2">Sem registro de pagamento.</div>
                    )}
                </CardContent>
            </Card>

            {/* DADOS DO CLIENTE */}
            <Card className="bg-card shadow-sm">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-blue-500" /> Dados do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    {sale.clientes ? (
                        <>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Nome Completo</p>
                                <p className="font-semibold text-lg text-foreground">{sale.clientes.nome}</p>
                                <p className="text-sm text-muted-foreground">{sale.clientes.cpf_cnpj}</p>
                            </div>
                            
                            {sale.clientes.email && (
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">E-mail</p>
                                    <p className="text-sm font-medium">{sale.clientes.email}</p>
                                </div>
                            )}

                            {(sale.clientes.cidade || sale.clientes.estado) && (
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Localização</p>
                                    <p className="text-sm font-medium">{sale.clientes.cidade} - {sale.clientes.estado}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <Button 
                                    onClick={() => openWhatsApp(sale.clientes?.whatsapp, sale.clientes?.nome || '')} 
                                    disabled={!sale.clientes?.whatsapp}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-12"
                                >
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Falar no WhatsApp
                                    <ExternalLink className="ml-2 h-3 w-3 opacity-50" />
                                </Button>
                                {!sale.clientes?.whatsapp && <p className="text-center text-xs text-muted-foreground mt-2">Cliente não possui WhatsApp cadastrado.</p>}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground py-6">
                            Cliente não identificado ou excluído.
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
      </div>

      <UpdateSaleStatusDialog sale={saleForModal} open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen} />

    </div>
  );
}