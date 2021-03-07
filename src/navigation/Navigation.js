import './Navigation.css';
import NavLink from './Navlink';
  
const Navigation = () => (
    <nav>
        <ul>
            <li><NavLink to="/">HOME</NavLink></li>
            <li><NavLink to="destinations">DESTINATIONS</NavLink></li>
            <li><NavLink to="search">SEARCH</NavLink></li>
            <li>
                DIVERS
                <ul>
                    <li><NavLink to="finning">FINNING</NavLink></li>
                    <li><NavLink to="simulation">SIMULATION</NavLink></li>
                </ul>
            </li>
        </ul>
    </nav>
);

export default Navigation;