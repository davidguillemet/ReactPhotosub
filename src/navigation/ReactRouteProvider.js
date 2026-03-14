
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

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

    const router = createBrowserRouter(fullRoutes);

    return (
        <RouterProvider router={router}>
            {children}
        </RouterProvider>
    )
};

export default ReactRouteProvider;