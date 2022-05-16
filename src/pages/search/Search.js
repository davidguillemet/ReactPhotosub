import React, { useCallback, useEffect } from 'react';
import { withRouter } from "react-router-dom";
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

const SearchPage = ({location, history}) => {

    const [query, setQuery] = React.useState(() => getQuerySearch(location.search));

    const onNewQueryString = useCallback((query) => {
        if (history.action !== 'PUSH')
            return;
        history.push({
            pathname: '/search',
            search: '?' + new URLSearchParams({query: query}).toString()
        })
    }, [history]);

    useEffect(() => {
        if (history.action === 'POP') {
            // Forward, Backward or Refresh
            // -> inject the query parameter from location.search 
            setQuery(getQuerySearch(location.search))
        }
    }, [location, history]);

    return (
        <React.Fragment>
            <PageTitle>Recherche</PageTitle>
            <Search
                showExactSwitch={true}
                galleryComponent={Gallery}
                nextPageComponent={NextPageButton}
                onNewQueryString={onNewQueryString}
                query={query}
            />
        </React.Fragment>
    );
};

export default withRouter(SearchPage);