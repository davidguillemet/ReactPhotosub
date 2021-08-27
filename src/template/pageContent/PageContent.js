import { Suspense, useEffect } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { Switch, Route, withRouter } from "react-router-dom";
import { routes } from '../../navigation/routes';

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

const PageContent = ({history, onHistoryChanged}) => {

    useEffect(() => history.listen(() => {
        // Close the Drawer
        onHistoryChanged();
    }), [history, onHistoryChanged])

    return (
        <Container
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
            }}
            disableGutters={true}
            maxWidth={false}
        >
            <Suspense fallback={<CircularProgress />}>
                <Switch>
                {
                    routes.map((route, index) => {
                        return (
                        <Route key={index} exact strict path={route.path}>
                            <RouteComponent route={route} />
                        </Route>
                        );
                    })
                }
                </Switch>
            </Suspense>
        </Container>
    );
};

export default withRouter(PageContent);