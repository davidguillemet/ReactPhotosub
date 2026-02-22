import { useLocation } from "react-router-dom";

export default function useCurrentPage() {

    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isSearchPage = location.pathname === '/search';

    return { isHomePage, isSearchPage };
};
