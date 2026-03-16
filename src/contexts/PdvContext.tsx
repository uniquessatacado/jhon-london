import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Customer, CartItem, Product, ProductVariation } from '@/types';
import { toast } from 'sonner';

export type SaleType = 'varejo' | 'atacado_geral' | 'atacado_grade' | null;

interface PdvContextType {
  customer: Customer | null;
  saleType: SaleType;
  cart: CartItem[];
  isSaleActive: boolean;
  startSale: (customer: Customer, saleType: SaleType) => void;
  clearSale: () => void;
  addToCart: (product: Product, variation: ProductVariation) => void;
  updateCartQuantity: (productId: number, tamanho: string, newQuantity: number) => void;
  removeFromCart: (productId: number, tamanho: string) => void;
}

const PdvContext = createContext<PdvContextType>({} as PdvContextType);

export function PdvProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [saleType, setSaleType] = useState<SaleType>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const isSaleActive = !!customer && !!saleType;

  const startSale = useCallback((selectedCustomer: Customer, selectedSaleType: SaleType) => {
    setCustomer(selectedCustomer);
    setSaleType(selectedSaleType);
    setCart([]);
  }, []);

  const clearSale = useCallback(() => {
    setCustomer(null);
    setSaleType(null);
    setCart([]);
  }, []);

  const removeFromCart = useCallback((productId: number, tamanho: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.variation.tamanho === tamanho)));
  }, []);

  const updateCartQuantity = useCallback((productId: number, tamanho: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, tamanho);
      return;
    }
    setCart(prev => prev.map(item => 
      item.productId === productId && item.variation.tamanho === tamanho 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  }, [removeFromCart]);

  const addToCart = useCallback((product: Product, variation: ProductVariation) => {
    let unitPrice = product.preco_varejo;
    if (saleType === 'atacado_geral' && product.habilita_atacado_geral && product.preco_atacado_geral > 0) {
      unitPrice = product.preco_atacado_geral;
    } else if (saleType === 'atacado_grade' && product.habilita_atacado_grade && product.preco_atacado_grade > 0) {
      unitPrice = product.preco_atacado_grade;
    }

    const existingItem = cart.find(item => item.productId === product.id && item.variation.tamanho === variation.tamanho);

    if (existingItem) {
      updateCartQuantity(product.id, variation.tamanho, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.nome,
        variation: {
          tamanho: variation.tamanho,
          sku: variation.sku,
        },
        quantity: 1,
        unitPrice: unitPrice, 
        image: product.imagem_principal,
      };
      setCart(prev => [...prev, newItem]);
    }
    toast.success(`${product.nome} (${variation.tamanho}) adicionado ao carrinho.`);
  }, [cart, saleType, updateCartQuantity]);

  return (
    <PdvContext.Provider value={{ 
      customer, 
      saleType, 
      cart, 
      isSaleActive, 
      startSale, 
      clearSale,
      addToCart,
      updateCartQuantity,
      removeFromCart
    }}>
      {children}
    </PdvContext.Provider>
  );
}

export const usePdv = () => useContext(PdvContext);