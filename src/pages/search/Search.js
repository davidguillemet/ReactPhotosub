import React, { useEffect } from 'react';
import { useLocation } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";

import Gallery from '../../components/gallery';
import Search from '../../components/search';
import { PageTitle } from '../../template/pageTypography';

const NextPageButton = ({
    onClick,
    loading,
    count       // The number of images currently displayed
}) => {

    return (
        <LoadingButton
            loading={loading}
            sx={{ mt: 3}}
            variant="contained"
            color="primary"
            onClick={onClick}>
                Résultats suivants
        </LoadingButton>
    );
};

function getQuerySearch(querySearch) {
    const queryParameters = new URLSearchParams(querySearch)
    return queryParameters.get("query");
}

const SearchPage = () => {

    const location = useLocation();
    const [query, setQuery] = React.useState(() => getQuerySearch(location.search));

    useEffect(() => {
        const locationQuery = getQuerySearch(location.search);
        if (locationQuery !== query) {
            setQuery(getQuerySearch(location.search))
        }
    }, [location.search, query]);

    return (
        <React.Fragment>
            <PageTitle>Recherche</PageTitle>
            <Search
                showExactSwitch={true}
                galleryComponent={Gallery}
                nextPageComponent={NextPageButton}
                pushHistory={true}
                query={query}
            />
        </React.Fragment>
    );
};

export default SearchPage;