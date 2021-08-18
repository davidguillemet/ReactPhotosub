import { NavLink } from "react-router-dom";
import HomeIcon from '@material-ui/icons/Home';
import LanguageIcon from '@material-ui/icons/Language';
import SearchIcon from '@material-ui/icons/Search';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { styled } from '@material-ui/core/styles';

import { lazy } from 'react';
const Home = lazy(() => import("../pages/home"));
const Destinations = lazy(() => import("../pages/destinations"));
const Destination = lazy(() => import("../pages/destination"));
const Search = lazy(() => import("../pages/search"));
const Finning = lazy(() => import("../pages/finning"));
const SimulationManager = lazy(() => import("../pages/simulation"));
const MySelection = lazy(() => import("../pages/favorites"));

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
        path: "/favorites",
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

export const NavigationLink = styled(NavLink)(
    ({theme}) => ({
        textDecoration: 'none',
        color: theme.palette.text.primary,
        "&.active span": {
            fontWeight: "bold",
            color: "#28a745"  
        },
        "&.active > div, &.active > li": {
            backgroundColor: "rgba(0,0,0,0.06)"
        }
    })
);

  