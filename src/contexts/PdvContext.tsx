import { createContext, useContext, useState, ReactNode } from 'react';
import { Customer, CartItem } from '@/types';

export type SaleType = 'varejo' | 'atacado_geral' | 'atacado_grade' | null;

interface PdvContextType {
  customer: Customer | null;
  saleType: SaleType;
  cart: CartItem[];
  isSaleActive: boolean;
  startSale: (customer: Customer, saleType: SaleType) => void;
  clearSale: () => void;
  // Futuras funções: addToCart, updateItem, applyDiscount, etc.
}

const PdvContext = createContext<PdvContextType>({} as PdvContextType);

export function PdvProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [saleType, setSaleType] = useState<SaleType>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const isSaleActive = !!customer && !!saleType;

  const startSale = (selectedCustomer: Customer, selectedSaleType: SaleType) => {
    setCustomer(selectedCustomer);
    setSaleType(selectedSaleType);
    setCart([]); // Limpa o carrinho para a nova venda
  };

  const clearSale = () => {
    setCustomer(null);
    setSaleType(null);
    setCart([]);
  };

  return (
    <PdvContext.Provider value={{ customer, saleType, cart, isSaleActive, startSale, clearSale }}>
      {children}
    </PdvContext.Provider>
  );
}

export const usePdv = () => useContext(PdvContext);