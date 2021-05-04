import Home from "../pages/home";
import Destinations from "../pages/destinations";
import Destination from "../pages/destination";
import Search from "../pages/search";
import Finning from "../pages/finning";
import SimulationManager from "../pages/simulation";
import MySelection from "../pages/favorites";

import HomeIcon from '@material-ui/icons/Home';
import LanguageIcon from '@material-ui/icons/Language';
import SearchIcon from '@material-ui/icons/Search';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { makeStyles } from '@material-ui/core/styles';

export const routes = [
    // Main Meu in Sidebar : sidebar = true
    {
        label: "Home",
        path: "/",
        component: <Home/>,
        icon: <HomeIcon />,
        sidebar: true
    },
    {
        label: "Destinations",
        path: "/destinations",
        component: <Destinations/>,
        icon: <LanguageIcon />,
        sidebar: true
    },
    {
        label: "Search",
        path: "/search",
        component: <Search/>,
        icon: <SearchIcon />,
        sidebar: true
    },
    {
        label: "Le Finning",
        path: "/finning",
        component: <Finning/>,
        icon: <HomeIcon />, // TODO
        sidebar: true
    },
    {
        label: "Simulation",
        path: "/simulation",
        component: <SimulationManager/>,
        icon: <HomeIcon />, // TODO
        sidebar: true
    },
    // Private menu for connected users : private = true
    {
        label: "Ma Sélection",
        path: "/my_selection",
        component: <MySelection />,
        icon: <FavoriteIcon fontSize="small" />,
        private: true
    },
    // Sub-pages, not directly accessible (for Router Switch) (private and sidebar are undefined)
    {
        label: null,
        path: "/destinations/:year/:title",
        component: <Destination/>,
    },
];

export const useMenuStyles = makeStyles((theme) => ({
    link: {
        textDecoration: 'none',
        color: theme.palette.text.primary,
        "&.active span": {
            fontWeight: "bold",
            color: "#28a745"  
        },
        "&.active > div, &.active > li": {
            backgroundColor: "rgba(0,0,0,0.06)"
        }
    }
}));
  