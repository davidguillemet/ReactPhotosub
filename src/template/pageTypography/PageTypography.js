import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import 'fontsource-roboto/100.css';
import 'fontsource-roboto/300.css';
import 'fontsource-roboto/400.css';

const TitleTypography = ({children, ...other}) => (<Typography variant="h2" component="h1" {...other}>{children}</Typography>);
const SubTitleTypography = ({children, ...other}) => (<Typography variant="h3" component="h2" {...other}>{children}</Typography>);
const HeaderTypography = ({children, ...other}) => (<Typography variant="h4" {...other}>{children}</Typography>);
const ParagraphTypography = ({children, ...other}) => (<Typography variant="h6" {...other}>{children}</Typography>);
const BodyTypography = ({children, ...other}) => (<Typography variant="body1" {...other}>{children}</Typography>);

export const Anchor = ({index}) => (
    <span id={`anchor${index}`} />
)

export const CustomDivider = () => <Divider variant="middle" sx={{ my: 3, mx: '20%', borderBottomWidth: 3, borderBottomColor: (theme) => theme.palette.primary.light}}/>

export const PageTitle = styled(TitleTypography)(({ theme }) => ({
    fontWeight: "300",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
}));

export const PageSubTitle = styled(SubTitleTypography)(({ theme }) => ({
    fontWeight: "100",
    textAlign: 'left',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3)
}));

export const PageHeader = styled(HeaderTypography)(({ theme }) => ({
    fontWeight: "100",
    textAlign: 'justify',
    marginBottom: theme.spacing(3)
}));

export const Paragraph = styled(ParagraphTypography)(({ theme }) => ({
    fontWeight: "300",
    textAlign: 'justify',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
}));

export const Body = styled(BodyTypography)(({ theme }) => ({
    fontWeight: "100",
    textAlign: 'justify',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
}));

export const BlockQuote = styled(ParagraphTypography)(({ theme }) => ({
    fontWeight: "300",
    textAlign: 'justify',
    marginBottom: theme.spacing(1),
    borderLeftWidth: '5px',
    borderLeftStyle: 'solid',
    borderLeftColor : theme.palette.text.disabled,
    paddingLeft: theme.spacing(3),
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(3),
    fontStyle: 'italic',
    color: theme.palette.text.secondary
}));
