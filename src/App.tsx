import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProductListPage } from './pages/products/ProductList';
import { NewProductPage } from './pages/products/NewProduct';
import { PDVPage } from './pages/PDV';
import { SettingsPage } from './pages/Settings';

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
        path: 'pdv',
        element: <PDVPage />,
      },
      {
        path: 'configuracoes',
        element: <SettingsPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
