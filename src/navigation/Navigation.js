import './Navigation.css';
import NavLink from './Navlink';
  
const Navigation = () => (
    <nav>
        <ul>
            <li><NavLink to="/" label="HOME"/></li>
            <li><NavLink to="/destinations" label="DESTINATIONS" /></li>
            <li><NavLink to="/search" label="SEARCH" /></li>
            <li>
                DIVERS
                <ul>
                    <li><NavLink to="/finning" label="FINNING" /></li>
                    <li><NavLink to="/simulation" label="SIMULATION" /></li>
                </ul>
            </li>
        </ul>
    </nav>
);

export default Navigation;