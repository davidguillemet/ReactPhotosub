import { useEffect } from 'react';

const useCancellable = (func, dependencies, dataProvider) => {

    useEffect(() => {
        const source = dataProvider.cancelTokenSource();
        func();
        return () => {
            source.cancel("Cancelling in cleanup");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
}

export default useCancellable;