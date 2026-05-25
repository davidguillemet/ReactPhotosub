import { useLocation } from "react-router";
import { HomePath, SearchPath } from "navigation/routes";

export default function useCurrentPage() {

    const location = useLocation();
    const isHomePage = location.pathname === HomePath;
    const isSearchPage = location.pathname === SearchPath;

    return { isHomePage, isSearchPage };
};
