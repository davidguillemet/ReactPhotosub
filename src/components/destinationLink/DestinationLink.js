import { Link } from 'react-router-dom';
import { withLoading, buildLoadingState } from '../hoc';

const DestinationLink = withLoading(({destination, children}) => {
    if (destination === null) {
        return null;
    }
    return (
        <Link to={`/destinations/${destination.path}`} style={{textDecoration: 'none'}}>
            {children}
        </Link>
    );
}, [buildLoadingState("destination", [undefined])], { size: 20 });

export default DestinationLink;