import React, { useEffect } from 'react';
import LoadingButton from "@mui/lab/LoadingButton";

import Gallery from 'components/gallery';
import Search, { getSettingsFromQueryParameters } from 'components/search';
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
            loading={loading}
            sx={{ mt: 3, width: "100%"}}
            onClick={onClick}>
                {t("button::nextResults")}
        </LoadingButton>
    );
};

const SearchPage = () => {

    const t = useTranslation("pages.search");
    const getQueryParameter = useQueryParameter();
    const [query, setQuery] = React.useState(() => getQueryParameter("query"));
    const [settings, setSettings] = React.useState(() => getSettingsFromQueryParameters(getQueryParameter));

    useEffect(() => {
        const locationQuery = getQueryParameter("query");
        if (locationQuery !== query) {
            setQuery(locationQuery)
        }
    }, [getQueryParameter, query]);

    useEffect(() => {
        const newSettings = getSettingsFromQueryParameters(getQueryParameter)
        setSettings(newSettings);
    }, [getQueryParameter]);

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <Search
                showExactSwitch={true}
                galleryComponent={Gallery}
                nextPageComponent={NextPageButton}
                pushHistory={true}
                query={query}
                settings={settings}
            />
        </React.Fragment>
    );
};

export default SearchPage;