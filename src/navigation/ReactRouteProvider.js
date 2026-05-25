
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router";

import { buildRoutes, buildRoute, APP_ROUTE_PATH, HomePath } from './routes';
import { useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "components/dataProvider";
import { useFirebaseContext } from "components/firebase";

const ReactRouteProvider = ({ children }) => {

    const queryClient = useQueryClient();
    const dataProvider = useDataProvider();
    const firebaseProvider = useFirebaseContext();

    const appRouteBase = {
        path: APP_ROUTE_PATH,
        page: "app",
        fullWidth: true,
        useHelmet: false // App component itself does not need Helmet, as it is used as a wrapper for all pages, and the Helmet of each page will be used instead, so we can disable it at the App level to avoid unnecessary HelmetProvider in the component tree, which can cause performance issues and unnecessary re-renders when the App component is rendered or updated.
    };

    const appRoute = buildRoute(appRouteBase, queryClient, dataProvider, firebaseProvider);

    const fullRoutes = [
        {
            ...appRoute,
            children: [
                {
                    // Redirect root path "/" to home page "/home"
                    index: true,
                    loader: () => redirect(HomePath)
                },
                ...buildRoutes(queryClient, dataProvider, firebaseProvider),
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