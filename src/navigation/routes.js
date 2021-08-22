import { NavLink } from "react-router-dom";
import HomeIcon from '@material-ui/icons/Home';
import LanguageIcon from '@material-ui/icons/Language';
import SearchIcon from '@material-ui/icons/Search';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import SvgIcon from '@material-ui/core/SvgIcon';

import { styled } from '@material-ui/core/styles';

import { lazy } from 'react';
const Home = lazy(() => import("../pages/home"));
const Destinations = lazy(() => import("../pages/destinations"));
const Destination = lazy(() => import("../pages/destination"));
const Search = lazy(() => import("../pages/search"));
const Finning = lazy(() => import("../pages/finning"));
const SimulationManager = lazy(() => import("../pages/simulation"));
const About = lazy(() => import("../pages/about"));
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
        icon: <SvgIcon><path d="M 7 3 C 6.25 3 5.781 3.25 6 4 C 7.198 8.109 8 10.75 8 13 C 8 15.781 7.163 16.985 7 17 C 7.739 17.754 8.806 18 9.5 18 C 10.194 18 11.261 17.754 12 17 C 12.739 17.754 13.806 18 14.5 18 C 15.194 18 16.261 17.754 17 17 C 17.739 17.754 18.806 18 19.5 18 C 19.649 18 19.823 17.99375 20 17.96875 C 19.976 13.04975 15.87 8.87 14 7 C 12.681 5.681 8.708 3 7 3 z M 2 19 L 2 21 C 2.739 21.754 3.806 22 4.5 22 C 5.194 22 6.261 21.754 7 21 C 7.739 21.754 8.806 22 9.5 22 C 10.194 22 11.261 21.754 12 21 C 12.739 21.754 13.806 22 14.5 22 C 15.194 22 16.261 21.754 17 21 C 17.739 21.754 18.806 22 19.5 22 C 20.194 22 21.261 21.754 22 21 L 22 19 C 21.261 19.754 20.194 20 19.5 20 C 18.806 20 17.739 19.754 17 19 C 16.261 19.754 15.194 20 14.5 20 C 13.806 20 12.739 19.754 12 19 C 11.261 19.754 10.194 20 9.5 20 C 8.806 20 7.739 19.754 7 19 C 6.261 19.754 5.194 20 4.5 20 C 3.806 20 2.739 19.754 2 19 z"/></SvgIcon>,
        sidebar: true
    },
    {
        label: "Simulation",
        path: "/simulation",
        component: <SimulationManager/>,
        icon: <HomeIcon />, // TODO
        sidebar: true
    },
    {
        label: "A propos",
        path: "/about",
        component: <About/>,
        icon: <PersonOutlineIcon />,
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

  