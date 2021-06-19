import { Link } from 'react-router-dom';

const DestinationLink = ({destination, children}) => {
    return (
        <Link to={`/destinations/${destination.path}`}>
            {children}
        </Link>
    );
}

export default DestinationLink;