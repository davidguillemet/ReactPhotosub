import { Suspense } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route } from "react-router-dom";
import { routes } from '../../navigation/routes';

const useStyles = makeStyles((theme) => ({
    pageContainerRoot: {
      width: 'unset'
    },
    pageContainer: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      marginRight: theme.spacing(3),
      marginLeft: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
      },
      padding: 0,
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      flexWrap: 'wrap',
      alignItems: 'center',
      textAlign: 'center'
    }
}));  

const PageContent = () => {
    const classes = useStyles();

    return (
        <Container className={classes.pageContainer} classes={{root: classes.pageContainerRoot}} maxWidth={false}>
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

export default PageContent;