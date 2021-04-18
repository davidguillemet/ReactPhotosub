import Typography from '@material-ui/core/Typography';

const PageTitle = (props) => {
    const { children } = props;
    return (
        <Typography variant="h2" component="h1">{children}</Typography>
    );
};

export default PageTitle;