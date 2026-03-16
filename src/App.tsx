import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import { useAuth } from './contexts/AuthContext';

// Componente de guarda para rotas que precisam de verificação de usuário
const PdvRouteGuard = () => {
  const { featureStatus } = useAuth();
  if (!featureStatus) return null; // ou um loader
  // Atualizado para usar a chave direta do novo JSON: pdv_liberado
  return featureStatus.pdv_liberado ? <PDVPage /> : <UnderConstructionPage />;
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
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'produtos',
        element: <ProductListPage />,
      },
      {
        path: 'produtos/novo',
        element: <NewProductPage />,
      },
      {
        path: 'produtos/editar/:id',
        element: <NewProductPage />,
      },
      {
        path: 'pdv',
        element: <PdvRouteGuard />,
      },
      {
        path: 'clientes',
        element: <CustomerListPage />,
      },
      {
        path: 'usuarios',
        element: <UserPage />,
      },
      {
        path: 'configuracoes/geral',
        element: <GeneralSettingsPage />,
      },
      {
        path: 'configuracoes/categorias',
        element: <CategoryPage />,
      },
      {
        path: 'configuracoes/marcas',
        element: <BrandPage />,
      },
      {
        path: 'configuracoes/grades',
        element: <GridPage />,
      },
      {
        path: 'configuracoes/liberacao-funcionalidades',
        element: <FeatureReleasePage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;