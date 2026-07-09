import React, { useEffect } from 'react';

import Gallery from 'components/gallery';
import Search, { defaultSettings } from 'components/search';
import { PageTitle } from 'template/pageTypography';
import { useTranslation } from 'utils';
import { useQueryParameter } from 'utils';
import NextPageButton from 'components/search/NextPageButton';

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
                showSettings={false}
                galleryComponent={Gallery}
                nextPageComponent={NextPageButton}
                pushHistory={true}
                query={query}
                settings={defaultSettings}
            />
        </React.Fragment>
    );
};

export default SearchPage;

export const Component = SearchPage;
