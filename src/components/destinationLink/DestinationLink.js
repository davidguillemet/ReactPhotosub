import { Link } from 'react-router-dom';

const DestinationLink = ({destination, children}) => {
    return (
        <Link to={`/destinations/${destination.path}`} style={{textDecoration: 'none'}}>
            {children}
        </Link>
    );
}

export default DestinationLink;