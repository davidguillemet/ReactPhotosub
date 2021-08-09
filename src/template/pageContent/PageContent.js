import { Suspense, useEffect } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { Switch, Route, withRouter } from "react-router-dom";
import { routes } from '../../navigation/routes';

const PageContent = ({history, onHistoryChanged}) => {

    useEffect(() => history.listen(() => {
        // do something on route change
        // for my example, close a drawer
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
                my: 3,
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
                            {route.component}
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