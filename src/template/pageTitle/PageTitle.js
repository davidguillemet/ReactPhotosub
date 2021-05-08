import Typography from '@material-ui/core/Typography';
import 'fontsource-roboto/100.css';

const PageTitle = (props) => {
    const { children } = props;
    return (
        <Typography variant="h2" component="h1" style={{fontWeight: "100"}}>{children}</Typography>
    );
};

export default PageTitle;