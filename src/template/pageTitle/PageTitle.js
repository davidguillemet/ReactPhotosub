import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import 'fontsource-roboto/100.css';

const useStyles = makeStyles((theme) => ({
    title: {
        fontWeight: "100",
        [theme.breakpoints.up('xs')]: {
            fontSize: "24pt"
        },
        [theme.breakpoints.up('sm')]: {
            fontSize: "34pt"
        },
        [theme.breakpoints.up('md')]: {
            fontSize: "44pt"
        }
    },
}));
  
const PageTitle = (props) => {
    const classes = useStyles();
    const { children } = props;
    return (
        <Typography variant="h2" component="h1" className={clsx(classes.title, props.className)} style={props.style}>{children}</Typography>
    );
};

export default PageTitle;