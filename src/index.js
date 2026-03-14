import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import reportWebVitals from './reportWebVitals';
import 'fontsource-roboto';

import ChainedProviders from './components/chainedProviders';
import { ToastContextProvider } from './components/notifications';
import { ReactQueryClientProvider } from './components/reactQuery';
import { FirebaseProvider } from './components/firebase';
import { TranslationProvider } from './utils';
import { OverlayProvider } from './components/loading/loadingOverlay';
import { DataManagerProvider } from './components/dataProvider';
import ReactRouteProvider from './navigation/ReactRouteProvider';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <ChainedProviders providers={[
            ToastContextProvider,
            ReactQueryClientProvider,
            OverlayProvider,
            TranslationProvider,
            FirebaseProvider,
            DataManagerProvider,
            ReactRouteProvider // Final RouteProvider should be the last provider in the chain
        ]}>
        </ChainedProviders>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
