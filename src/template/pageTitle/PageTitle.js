import { styled } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import 'fontsource-roboto/100.css';

const TitleTypography = ({children, ...other}) => (<Typography variant="h2" component="h1" {...other}>{children}</Typography>);

const PageTitle = styled(TitleTypography)(({ theme }) => ({
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

export const PageSubTitle = styled(TitleTypography)(({ theme }) => ({
    fontWeight: "100",
    [theme.breakpoints.up('xs')]: {
        fontSize: "18pt"
    },
    [theme.breakpoints.up('sm')]: {
        fontSize: "24pt"
    },
    [theme.breakpoints.up('md')]: {
        fontSize: "30pt"
    }
}));

export default PageTitle;