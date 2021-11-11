import { Link } from 'react-router-dom';
import { withLoading, buildLoadingState } from '../loading';

const DestinationLink = withLoading(({destination, children}) => {
    return (
        <Link to={`/destinations/${destination.path}`} style={{textDecoration: 'none'}}>
            {children}
        </Link>
    );
}, [buildLoadingState("destination", [null, undefined])]);

export default DestinationLink;