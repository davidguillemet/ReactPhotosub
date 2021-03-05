import './Navigation.css';
import NavLink from './Navlink';
import logo from '../assets/images/logo.jpg';
  
const Navigation = () => (
    <div className="header">
        <img src={logo} className="logo" alt="logo" />
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
    </div>
);

export default Navigation;