import { styled } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import 'fontsource-roboto/100.css';

const TitleTypography = ({children, ...other}) => (<Typography variant="h2" component="h1" {...other}>{children}</Typography>);

const PageTitle = styled(TitleTypography)(({ theme }) => ({
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
}));

export default PageTitle;