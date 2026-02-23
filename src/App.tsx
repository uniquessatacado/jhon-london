import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProductListPage } from './pages/products/ProductList';
import { NewProductPage } from './pages/products/NewProduct';
import { PDVPage } from './pages/PDV';
import { CategoryPage } from './pages/settings/CategoryPage';
import { BrandPage } from './pages/settings/BrandPage';

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
        path: 'configuracoes/categorias',
        element: <CategoryPage />,
      },
      {
        path: 'configuracoes/marcas',
        element: <BrandPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;