import React, { lazy } from 'react';
import { Loading } from 'components/hoc';

const importLazyModule = (path, silentError) => {
    return lazy(() => import(`./${path}`).catch(() => import(`./ModuleNotFound`)));
}

const LazyContent = ({path, silentError = false}) => {
    const LazySummaryView = React.useMemo(() => {
        return importLazyModule(path, silentError);
    }, [path, silentError]);

    // The property name is used for ModuleNotFound...
    return (
        <React.Suspense fallback={<Loading/>}>
            <LazySummaryView name={path} />
        </React.Suspense>
    );
}

export default LazyContent;