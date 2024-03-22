import React, { useEffect } from 'react';
import LoadingButton from "@mui/lab/LoadingButton";

import Gallery from '../../components/gallery';
import Search from '../../components/search';
import { PageTitle } from '../../template/pageTypography';
import { useTranslation } from '../../utils';
import { useQueryParameter } from '../../utils';

const NextPageButton = ({
    onClick,
    loading,
    count       // The number of images currently displayed
}) => {
    const t = useTranslation("pages.search");
    return (
        <LoadingButton
            loading={loading}
            sx={{ mt: 3}}
            variant="contained"
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

    useEffect(() => {
        const locationQuery = getQueryParameter("query");
        if (locationQuery !== query) {
            setQuery(locationQuery)
        }
    }, [getQueryParameter, query]);

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
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