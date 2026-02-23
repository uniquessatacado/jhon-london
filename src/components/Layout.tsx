import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, Menu, LogOut, ChevronDown, Tag, Building, CircleUser, Server, Grid as GridIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/pdv', icon: ShoppingCart, label: 'PDV' },
];

const settingsNavItems = [
    { to: '/configuracoes/categorias', label: 'Categorias', icon: Tag },
    { to: '/configuracoes/marcas', label: 'Marcas', icon: Building },
    { to: '/configuracoes/grades', label: 'Grades', icon: GridIcon },
    { to: '/configuracoes/status-api', label: 'Status da API', icon: Server },
]

const NavLinkItem = ({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive 
        ? 'bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30 backdrop-blur-sm' 
        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1'
      }`
    }
  >
    <Icon className="h-5 w-5" />
    {label}
  </NavLink>
);

const AnimatedLogo = () => {
  // Key trick to restart animation on mount if needed, 
  // but CSS animation runs on render.
  return (
    <div className="flex items-center gap-2 font-bold text-xl px-2">
      <div className="relative">
        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-primary pr-1">
          John London ERP
        </span>
      </div>
    </div>
  );
};

export function Layout() {
  const location = useLocation();
  const isSettingsOpen = location.pathname.startsWith('/configuracoes');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent && mainContent.scrollTop > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Attach listener to the scrollable div
    const mainDiv = document.getElementById('main-content');
    mainDiv?.addEventListener('scroll', handleScroll);
    return () => mainDiv?.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden p-2 md:p-4 gap-4">
      
      {/* Sidebar Flutuante (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden transition-all duration-300">
        <div className="flex h-20 items-center justify-center border-b border-white/5 px-6">
           <AnimatedLogo />
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          <nav className="grid items-start gap-2">
            {navItems.map(item => <NavLinkItem key={item.to} {...item} />)}
             
             <Collapsible defaultOpen={isSettingsOpen} className="mt-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground [&[data-state=open]>svg]:rotate-180 group">
                 <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 group-hover:text-primary transition-colors" />
                  <span>Configurações</span>
                 </div>
                 <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2 space-y-1">
                  <div className="border-l border-white/10 pl-2 space-y-1">
                    {settingsNavItems.map(item => <NavLinkItem key={item.to} {...item} />)}
                  </div>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </div>
        <div className="p-4 border-t border-white/5 bg-white/5">
            <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                    JL
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Admin User</span>
                    <span className="text-xs text-muted-foreground">admin@johnlondon.com</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full rounded-3xl bg-card/30 backdrop-blur-md border border-white/5 shadow-2xl overflow-hidden relative">
        
        {/* Header Glass */}
        <header className={`flex h-16 items-center gap-4 px-6 transition-all duration-300 z-10 sticky top-0 ${scrolled ? 'bg-black/40 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-foreground hover:bg-white/10 rounded-xl">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-black/90 backdrop-blur-xl border-r-white/10 text-foreground">
              <nav className="grid gap-2 text-lg font-medium mt-8">
                <div className="mb-6 px-2">
                    <AnimatedLogo />
                </div>
                {navItems.map(item => <NavLinkItem key={item.to} {...item} />)}
                 <div className="h-px bg-white/10 my-4" />
                 <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configurações</span>
                 {settingsNavItems.map(item => <NavLinkItem key={item.to} {...item} />)}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1">
             {/* Você pode adicionar uma barra de busca flutuante aqui depois */}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <CircleUser className="h-6 w-6" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-black/80 backdrop-blur-xl border-white/10 text-foreground">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 rounded-xl cursor-pointer">Configurações</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 rounded-xl cursor-pointer">Suporte</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="focus:bg-red-500/20 focus:text-red-400 rounded-xl cursor-pointer">
                <NavLink to="/login" className="flex items-center w-full text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Scrollable Content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}