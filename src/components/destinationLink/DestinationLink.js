import { Link } from 'react-router-dom';
import { withLoading, buildLoadingState } from '../hoc';
import { useAuthContext } from 'components/authentication';

const DestinationLink = withLoading(({destination, children}) => {
    const authContext = useAuthContext();
    if (destination === null || (authContext.admin === false && destination.published === false)) {
        // don't display the destination if it is not published while the user is not admin
        return null;
    }
    return (
            <Link to={`/destinations/${destination.path}`} style={{textDecoration: 'none'}}>
                {children}
            </Link>
    );
}, [buildLoadingState("destination", [undefined])], { size: 20, sx: { m: 0 }});

export default DestinationLink;