import React, { lazy } from 'react';
import { Loading } from 'components/hoc';

const importLazyModule = (path, silentError) => {
    return lazy(() => import(`./${path}`).catch(() => import(`./ModuleNotFound`)));
}

const LazyContent = ({path, silentError = false}) => {
    const LazySummaryView = React.useMemo(() => {
        return importLazyModule(path, silentError);
    }, [path, silentError]);

    return (
        <React.Suspense fallback={<Loading/>}>
            <LazySummaryView />
        </React.Suspense>
    );
}

export default LazyContent;