import React, { useEffect } from 'react';
import LoadingButton from "@mui/lab/LoadingButton";

import Gallery from 'components/gallery';
import Search from 'components/search';
import { PageTitle } from 'template/pageTypography';
import { useTranslation } from 'utils';
import { useQueryParameter } from 'utils';

const NextPageButton = ({
    onClick,
    loading,
    count       // The number of images currently displayed
}) => {
    const t = useTranslation("pages.search");
    return (
        <LoadingButton
            variant="outlined"
            loading={loading}
            sx={{ mt: 3, width: "100%"}}
            color="primary"
            onClick={onClick}>
                {t("button::nextResults")}
        </LoadingButton>
    );
};

const SearchPage = () => {

    const t = useTranslation("pages.search");
    const getQueryParameter = useQueryParameter();
    const [query, setQuery] = React.useState(() => getQueryParameter("query"));
    const [exact, setExact] = React.useState(() => getQueryParameter("exact"));

    useEffect(() => {
        const locationQuery = getQueryParameter("query");
        if (locationQuery !== query) {
            setQuery(locationQuery)
        }
    }, [getQueryParameter, query]);

    useEffect(() => {
        const exactParameterString = getQueryParameter("exact");
        const exactParameter = exactParameterString === 'true';
        if (exactParameter !== exact) {
            setExact(exactParameter)
        }
    }, [getQueryParameter, exact]);

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <Search
                showExactSwitch={true}
                galleryComponent={Gallery}
                nextPageComponent={NextPageButton}
                pushHistory={true}
                query={query}
                exact={exact}
            />
        </React.Fragment>
    );
};

export default SearchPage;