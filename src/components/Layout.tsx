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
    end // Garante que a rota exata seja marcada como ativa
    className={({ isActive }) =>
      `flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
      }`
    }
  >
    <Icon className="h-5 w-5" />
    {label}
  </NavLink>
);

export function Layout() {
  const location = useLocation();
  const isSettingsOpen = location.pathname.startsWith('/configuracoes');
  
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-4">
          <div className="flex h-16 items-center border-b px-6">
            <NavLink to="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">John London ERP</span>
            </NavLink>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navItems.map(item => <NavLinkItem key={item.to} {...item} />)}
               <Collapsible defaultOpen={isSettingsOpen} className="mt-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground [&[data-state=open]>svg]:rotate-180">
                   <div className="flex items-center gap-4">
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                   </div>
                   <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 pt-2 space-y-1">
                    {settingsNavItems.map(item => <NavLinkItem key={item.to} {...item} />)}
                </CollapsibleContent>
              </Collapsible>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-background">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-card border-r-0">
              <nav className="grid gap-2 text-lg font-medium">
                <NavLink
                  to="/"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <span>John London ERP</span>
                </NavLink>
                {navItems.map(item => <NavLinkItem key={item.to} {...item} />)}
                 <NavLinkItem to="/configuracoes/categorias" icon={Tag} label="Categorias" />
                 <NavLinkItem to="/configuracoes/marcas" icon={Building} label="Marcas" />
                 <NavLinkItem to="/configuracoes/grades" icon={GridIcon} label="Grades" />
                 <NavLinkItem to="/configuracoes/status-api" icon={Server} label="Status da API" />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Espaço para busca futura */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <CircleUser className="h-6 w-6" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NavLink to="/login" className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}