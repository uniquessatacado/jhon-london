import { createBrowserRouter, RouterProvider, RouteObject } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProductListPage } from './pages/products/ProductList';
import { NewProductPage } from './pages/products/NewProduct';
import { PDVPage } from './pages/PDV';
import { CategoryPage } from './pages/settings/CategoryPage';
import { BrandPage } from './pages/settings/BrandPage';
import { GridPage } from './pages/settings/GridPage';
import { GeneralSettingsPage } from './pages/settings/GeneralSettingsPage';
import { UserPage } from './pages/users/UserPage';
import { CustomerListPage } from './pages/customers/CustomerListPage';
import { UnderConstructionPage } from './pages/UnderConstructionPage';
import { FeatureReleasePage } from './pages/settings/FeatureReleasePage';
import { SalesListPage } from './pages/sales/SalesListPage';
import { useAuth } from './contexts/AuthContext';

const FeatureGuard = ({ featureKey, children }: { featureKey: string, children: React.ReactNode }) => {
  const { featureStatus } = useAuth();
  if (!featureStatus) return null;
  return featureStatus[featureKey] ? <>{children}</> : <UnderConstructionPage />;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'produtos', element: <ProductListPage /> },
      { path: 'produtos/novo', element: <NewProductPage /> },
      { path: 'produtos/editar/:id', element: <NewProductPage /> },
      { path: 'pdv', element: <FeatureGuard featureKey="pdv_liberado"><PDVPage /></FeatureGuard> },
      { path: 'vendas', element: <FeatureGuard featureKey="vendas_liberado"><SalesListPage /></FeatureGuard> },
      { path: 'clientes', element: <CustomerListPage /> },
      { path: 'usuarios', element: <UserPage /> },
      { path: 'configuracoes/geral', element: <GeneralSettingsPage /> },
      { path: 'configuracoes/categorias', element: <CategoryPage /> },
      { path: 'configuracoes/marcas', element: <BrandPage /> },
      { path: 'configuracoes/grades', element: <GridPage /> },
      { path: 'configuracoes/liberacao-funcionalidades', element: <FeatureReleasePage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;