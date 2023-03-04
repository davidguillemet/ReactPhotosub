import { NavLink } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SvgIcon from '@mui/material/SvgIcon';

import { styled } from '@mui/material/styles';

import { lazy } from 'react';
const Home = lazy(() => import("../pages/home"));
const Destinations = lazy(() => import("../pages/destinations"));
const Destination = lazy(() => import("../pages/destination"));
const Search = lazy(() => import("../pages/search"));
const Finning = lazy(() => import("../pages/finning"));
const SimulationManager = lazy(() => import("../pages/simulation"));
const About = lazy(() => import("../pages/about"));
const Contact = lazy(() => import("../pages/contact"));
const MySelection = lazy(() => import("../pages/favorites"));
const MyProfile = lazy(() => import("../pages/profile"));
const Admin = lazy(() => import("../pages/admin"));

export const HomePath = "/";
export const DestinationsPath = "/destinations";
export const SearchPath = "/search";
export const FinningPath = "/finning";
export const SimulationPath = "/composition";
export const AboutPath = "/about";
export const ContactPath = "/contact";
export const FavoritesPath = "/favorites";
export const ProfilPath = "/profil";
export const DestinationPath = "/destinations/:year/:title";
export const AdminPath = "/admin";

export const ROUTES_NAMESPACE = "menu";

export const routes = [
    // Main Meu in Sidebar : sidebar = true
    {
        label: "home",
        path: HomePath,
        component: Home,
        icon: <HomeIcon />,
        sidebar: true,
        fullWidth: true,
        description: null
    },
    {
        label: "destinations",
        path: DestinationsPath,
        component: Destinations,
        icon: <FlightTakeoffIcon />,
        sidebar: true,
        fullWidth: true,
        description: null
    },
    {
        label: "search",
        path: SearchPath,
        component: Search,
        icon: <SearchIcon />,
        sidebar: true,
        fullWidth: true,
        description: null
    },
    {
        label: "finning",
        path: FinningPath,
        component: Finning,
        icon: <SvgIcon><path d="M 7 3 C 6.25 3 5.781 3.25 6 4 C 7.198 8.109 8 10.75 8 13 C 8 15.781 7.163 16.985 7 17 C 7.739 17.754 8.806 18 9.5 18 C 10.194 18 11.261 17.754 12 17 C 12.739 17.754 13.806 18 14.5 18 C 15.194 18 16.261 17.754 17 17 C 17.739 17.754 18.806 18 19.5 18 C 19.649 18 19.823 17.99375 20 17.96875 C 19.976 13.04975 15.87 8.87 14 7 C 12.681 5.681 8.708 3 7 3 z M 2 19 L 2 21 C 2.739 21.754 3.806 22 4.5 22 C 5.194 22 6.261 21.754 7 21 C 7.739 21.754 8.806 22 9.5 22 C 10.194 22 11.261 21.754 12 21 C 12.739 21.754 13.806 22 14.5 22 C 15.194 22 16.261 21.754 17 21 C 17.739 21.754 18.806 22 19.5 22 C 20.194 22 21.261 21.754 22 21 L 22 19 C 21.261 19.754 20.194 20 19.5 20 C 18.806 20 17.739 19.754 17 19 C 16.261 19.754 15.194 20 14.5 20 C 13.806 20 12.739 19.754 12 19 C 11.261 19.754 10.194 20 9.5 20 C 8.806 20 7.739 19.754 7 19 C 6.261 19.754 5.194 20 4.5 20 C 3.806 20 2.739 19.754 2 19 z"/></SvgIcon>,
        sidebar: true,
        fullWidth: false,
        description: null
    },
    {
        label: "composition",
        path: SimulationPath,
        component: SimulationManager,
        icon: <ViewQuiltIcon />,
        sidebar: true,
        fullWidth: true,
        description: null
    },
    {
        label: "about",
        path: AboutPath,
        component: About,
        icon: <PersonOutlineIcon />,
        sidebar: true,
        fullWidth: false,
        description: null
    },
    {
        label: "contact",
        path: ContactPath,
        component: Contact,
        icon: <MailOutlineIcon />,
        sidebar: true,
        fullWidth: false,
        maxWidth: 550,
        description: null
    },
    // Private menu for connected users : private = true
    {
        label: "favorites",
        path: FavoritesPath,
        component: MySelection,
        icon: <FavoriteIcon fontSize="small" />,
        private: true,
        fullWidth: true
    },
    {
        label: "profile",
        path: ProfilPath,
        component: MyProfile,
        icon: <AccountBoxIcon fontSize="small" />,
        private: true,
        fullWidth: false
    },
    {
        label: "admin",
        path: AdminPath,
        component: Admin,
        icon: <AdminPanelSettingsIcon fontSize="small" />,
        private: true,
        fullWidth: false
    },
    // Sub-pages, not directly accessible (for Router Switch) (private and sidebar are undefined)
    {
        label: null,
        path: DestinationPath,
        component: Destination,
        fullWidth: true
    },
];

export const NavigationLink = styled(NavLink)(
    ({theme}) => ({
        textDecoration: 'none',
        color: theme.palette.text.primary,
        "&.active span": {
            fontWeight: "bold",
            color: theme.palette.link.main
        },
        "&.active > div, &.active > li": {
            backgroundColor: "rgba(0,0,0,0.06)"
        }
    })
);

  