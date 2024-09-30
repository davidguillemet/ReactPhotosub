import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Switch, Route } from "react-router-dom";
import { routes } from '../../navigation/routes';
import { Loading } from '../../components/hoc';
import NotFound from '../../pages/notFound';
import { HelmetFull } from '../seo';
import { ToastNotifications } from '../../components/notifications';

const RouteComponent = ({route}) => {
    const Component = route.component;
    if (route.fullWidth) {
        return <Component />
    } else {
        return (
            <Box sx={{
                width: (theme) => theme.pageWidth.width,
                maxWidth: (theme) => route.maxWidth || theme.pageWidth.maxWidth,
            }}>
                <Component />
            </Box>
        )
    }
}

const PageContent = React.forwardRef((props, ref) => {

    return (
        <Container
            ref={ref}
            sx={{
                width: 'unset',
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                flexWrap: 'wrap',
                alignItems: 'center',
                textAlign: 'center',
                mx: {
                    "xs": 1,
                    "sm": 2,
                    "md": 3
                },
                my: 0,
                p: 0,
                pb: 3
            }}
            disableGutters={true}
            maxWidth={false}
            {...props}
        >
            <Suspense fallback={<Loading />}>
                <Switch>
                    {
                        routes.map((route, index) => {
                            return (
                            <Route key={index} exact strict path={route.path}>
                                <HelmetFull route={route} />
                                <RouteComponent route={route} />
                            </Route>
                            );
                        })
                    }
                    <Route path="*" component={NotFound} />
                </Switch>
            </Suspense>
            <ToastNotifications />
        </Container>
    );
});

export default PageContent;