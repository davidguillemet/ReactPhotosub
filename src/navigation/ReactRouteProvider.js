
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

import App from '../App';

import { buildRoutes } from 'navigation/routes';
import { useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "components/dataProvider";

const ReactRouteProvider = ({ children }) => {

    const queryClient = useQueryClient();
    const dataProvider = useDataProvider();

    const fullRoutes = [
        {
            element: <App />,
            path: "/",
            children: [
                ...buildRoutes(queryClient, dataProvider),
                {
                    path: "*",
                    lazy: () => import('pages/notFound')
                }
            ]
        }
    ];

    const router = createBrowserRouter(fullRoutes, {
        future: {
            // Activate V7 features before upgrading
            // https://reactrouter.com/upgrading/v6
            v7_relativeSplatPath: true,
            v7_fetcherPersist: true,
            v7_normalizeFormMethod: true,
            v7_partialHydration: true,
            v7_skipActionErrorRevalidation: true,
            v7_startTransition: true
        }
    });

    return (
        <RouterProvider router={router}>
            {children}
        </RouterProvider>
    )
};

export default ReactRouteProvider;