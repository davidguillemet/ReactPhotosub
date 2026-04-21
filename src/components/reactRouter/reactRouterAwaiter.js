import React from 'react';
import { Await } from 'react-router';

import ErrorAlert from 'components/error';
import { Loading } from 'components/hoc';

export const ReactRouterAwaiter = ({value, fallback, children}) => {

    return (
        <React.Suspense fallback={fallback ?? <Loading />}>
            <Await resolve={value} errorElement={<ErrorAlert/>}>
                {children}
            </Await>
        </React.Suspense>
    );
};
