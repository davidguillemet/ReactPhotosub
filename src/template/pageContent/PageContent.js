import React, { Suspense, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Switch, Route, useHistory } from "react-router-dom";
import { routes } from '../../navigation/routes';
import { Loading } from '../../components/hoc';
import NotFound from '../../pages/notFound';
import { HelmetFull } from '../seo';
import { ToastNotifications } from '../../components/notifications';

const RouteComponent = ({route, subscribeDrawer}) => {
    const Component = route.component;
    if (route.fullWidth) {
        return <Component subscribeDrawer={subscribeDrawer} />
    } else {
        return (
            <Box sx={{
                width: (theme) => theme.pageWidth.width,
                maxWidth: (theme) => route.maxWidth || theme.pageWidth.maxWidth,
            }}>
                <Component subscribeDrawer={subscribeDrawer} />
            </Box>
        )
    }
}

const isImageLocation = (locationSearch) => {
    return locationSearch.startsWith("?image=");
}

const PageContent = React.forwardRef(({onHistoryChanged, subscribeDrawer}, ref) => {
    const history = useHistory();

    const previousLocationSearch = React.useRef("");

    useEffect(() => {
        history.listen((location, action) => {
            onHistoryChanged();
            if (!isImageLocation(location.search) && !isImageLocation(previousLocationSearch.current)) {
                // Scroll to the top of the new page, unless we display an image in the expanded view (new location)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            previousLocationSearch.current = location.search;
        });
    }, [history, onHistoryChanged])

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
        >
            <Suspense fallback={<Loading />}>
                <Switch>
                    {
                        routes.map((route, index) => {
                            return (
                            <Route key={index} exact strict path={route.path}>
                                <HelmetFull route={route} />
                                <RouteComponent route={route} subscribeDrawer={subscribeDrawer} />
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