import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, Menu, LogOut, ChevronDown, Tag, Building, CircleUser, Server, Grid as GridIcon, Settings2, Users } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileDialog } from '@/components/users/UserProfileDialog';
import { UserPermissions } from '@/types/auth';

// Mapeamento de rotas para chaves de permissão
// Se permissionKey for undefined, é visível para todos (ou apenas admin se não tratado)
const navItems = [
  { to: '/', icon: Home, label: 'Dashboard', permissionKey: 'dashboard' as keyof UserPermissions },
  { to: '/produtos', icon: Package, label: 'Produtos', permissionKey: 'produtos' as keyof UserPermissions },
  { to: '/pdv', icon: ShoppingCart, label: 'PDV', permissionKey: 'financeiro' as keyof UserPermissions },
  { to: '/usuarios', icon: Users, label: 'Usuários', permissionKey: 'usuarios' as keyof UserPermissions },
];

const settingsNavItems = [
    { to: '/configuracoes/geral', label: 'Geral', icon: Settings2 },
    { to: '/configuracoes/categorias', label: 'Categorias', icon: Tag },
    { to: '/configuracoes/marcas', label: 'Marcas', icon: Building },
    { to: '/configuracoes/grades', label: 'Grades', icon: GridIcon },
    { to: '/configuracoes/status-api', label: 'Status da API', icon: Server },
];

const NavLinkItem = ({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive 
        ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20 backdrop-blur-sm' 
        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1'
      }`
    }
  >
    <Icon className="h-5 w-5" />
    {label}
  </NavLink>
);

const AnimatedLogo = () => {
  return (
    <div className="flex items-center gap-4 px-2 select-none group">
       <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.2)] border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors duration-500">
          <img 
            src="/logo.jpg" 
            alt="John London Logo" 
            className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
       </div>

       <div className="flex flex-col">
         <h1 className="text-xl font-bold tracking-tight leading-none">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500 bg-[size:200%_auto] bg-clip-text text-transparent animate-shimmer drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">
              John London
            </span>
         </h1>
         <span className="text-[0.65rem] font-medium text-emerald-500/60 uppercase tracking-[0.2em] mt-1">
            ERP System
         </span>
       </div>
    </div>
  );
};

export function Layout() {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const isSettingsOpen = location.pathname.startsWith('/configuracoes');
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent && mainContent.scrollTop > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    const mainDiv = document.getElementById('main-content');
    mainDiv?.addEventListener('scroll', handleScroll);
    return () => mainDiv?.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;

  // Filter Nav Items based on Permissions
  const allowedNavItems = navItems.filter(item => {
    if (user.role === 'admin') return true;
    return user.permissoes && user.permissoes[item.permissionKey];
  });

  const canAccessSettings = user.role === 'admin' || (user.permissoes && user.permissoes.cadastros);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden p-2 md:p-4 gap-4">
      
      {/* Sidebar Flutuante (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden transition-all duration-300">
        <div className="flex h-24 items-center justify-center border-b border-white/5 px-4 bg-gradient-to-b from-white/5 to-transparent">
           <AnimatedLogo />
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          <nav className="grid items-start gap-2">
            {allowedNavItems.map(item => <NavLinkItem key={item.to} {...item} />)}
             
             {canAccessSettings && (
               <Collapsible defaultOpen={isSettingsOpen} className="mt-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground [&[data-state=open]>svg]:rotate-180 group">
                   <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 group-hover:text-emerald-400 transition-colors" />
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
             )}
          </nav>
        </div>
        <div className="p-4 border-t border-white/5 bg-white/5">
            <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20">
                    {user.nome.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-foreground truncate">{user.nome}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full rounded-3xl bg-white/5 backdrop-blur-md border border-white/5 shadow-2xl overflow-hidden relative">
        
        {/* Header Glass */}
        <header className={`flex h-16 items-center gap-4 px-6 transition-all duration-300 z-10 sticky top-0 ${scrolled ? 'bg-background/40 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-foreground hover:bg-white/10 rounded-xl">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-background/95 backdrop-blur-xl border-r-white/10 text-foreground">
              <nav className="grid gap-2 text-lg font-medium mt-8">
                <div className="mb-6 px-2">
                    <AnimatedLogo />
                </div>
                {allowedNavItems.map(item => <NavLinkItem key={item.to} {...item} />)}
                 {canAccessSettings && (
                   <>
                     <div className="h-px bg-white/10 my-4" />
                     <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configurações</span>
                     {settingsNavItems.map(item => <NavLinkItem key={item.to} {...item} />)}
                   </>
                 )}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1"></div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <CircleUser className="h-6 w-6" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border-white/10 text-foreground">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 rounded-xl cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                  Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 rounded-xl cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
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

      <UserProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </div>
  );
}