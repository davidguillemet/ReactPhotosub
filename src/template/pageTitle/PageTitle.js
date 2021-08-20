import { styled } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import 'fontsource-roboto/100.css';

const TitleTypography = ({children, ...other}) => (<Typography variant="h2" component="h1" {...other}>{children}</Typography>);
const SubTitleTypography = ({children, ...other}) => (<Typography variant="h3" component="h2" {...other}>{children}</Typography>);

const PageTitle = styled(TitleTypography)(({ theme }) => ({
    fontWeight: "400",
}));

export const PageSubTitle = styled(SubTitleTypography)(({ theme }) => ({
    fontWeight: "100",
}));

export default PageTitle;