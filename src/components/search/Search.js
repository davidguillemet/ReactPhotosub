import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import Box from "@mui/material/Box";

import SearchInput from './searchInput';
import { uniqueID, useTranslation, useLanguage } from '../../utils';
import { LazyDialog } from 'dialogs';
import { useQueryContext } from '../queryContext';
import { useFirebaseContext } from '../firebase';
import { useDataProvider } from '../dataProvider';
import SearchResult from './searchResult';
import SearchSettings from './searchSettings';
import { getInitialSearchResult, pushSearchConfigHistory } from './searchUtils';

function getEmptySearchResult(query) {
    return {
        ...getInitialSearchResult(),
        query: query,
        totalCount: 0
    }
}

const Search = React.forwardRef(({
    showExactSwitch = true,
    showHelp = true,
    onResult = null,
    galleryComponent = null,
    nextPageComponent = null,
    query = null,
    pushHistory = false,
    pageIndex = 0,
    expandable = false,
    resultsOpen = false,
    onCloseResults = null,
    onExpandedChange = null,
    pageSize = 10,
    settings,
    alignItems = 'center'}, ref) => {

    const t = useTranslation("components.search");
    const { language } = useLanguage();
    const history = useHistory();
    const dataProvider = useDataProvider();
    const queryContext = useQueryContext();
    const firebaseContext = useFirebaseContext();
    const [ helpOpen, setHelpOpen ] = useState(false);
    const [ searchIsRunning, setSearchIsRunning ] = useState(false);
    const [ searchResult, setSearchResult] = useState(getInitialSearchResult())
    const [ searchConfig, setSearchConfig ] = useState({
        settings: settings,
        page: 0,
        query: query || ""
    });
    const { data: imageCount } = queryContext.useFetchImageCount();
    const searchTimer = useRef(null);

    const lastSearchProcessId = useRef(null);

    useEffect(() => {
        setSearchConfig(prevConfig => {
            return {
                settings: prevConfig.settings,
                page: 0,
                query: query || ""
            }
        })
    }, [query]);

    useEffect(() => {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                settings: { ...settings },
                page: 0
            }
        });
    }, [settings]);

    useEffect(() => {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                page: pageIndex
            }
        })
    }, [pageIndex])

    useEffect(() => {
        if (onResult) {
            onResult(searchResult);
        }
    }, [onResult, searchResult])

    useEffect(() => {
        if (searchResult.totalCount === -1) {
            return;
        }
    }, [searchResult]);

    useEffect(() => {
        if (searchConfig.query.length <= 2)
        {
            return;
        }

        setSearchIsRunning(true);

        lastSearchProcessId.current = uniqueID();

        dataProvider.searchImages(
            searchConfig.page,
            searchConfig.query,
            pageSize,
            searchConfig.settings,
            lastSearchProcessId.current
        ).then(response => {
            if (response.processId !== lastSearchProcessId.current) {
                console.log(`skip obsolete search results ${response.processId}`);
                return;
            }

            firebaseContext.logEvent("search", {
                search_term: searchConfig.query
            });

            // response format:
            // {
            //     items: <image array>,
            //     criteria: <criteria array>
            //     query: <string>,
            //     processId: <string>,
            //     totalCount: <integer>
            // }
            setSearchResult(oldResult => {
                const results = response.items;
                if (results.length === 0 && searchConfig.page === 0)
                {
                    return getEmptySearchResult(searchConfig.query);
                }
                const aggregatedResults = searchConfig.page === 0 ? results : oldResult.images.concat(results);
                const newResult = {
                    images: aggregatedResults,
                    hasNext: aggregatedResults.length < response.totalCount,
                    hasError: false,
                    page: searchConfig.page,
                    query: searchConfig.query,
                    totalCount: response.totalCount
                }
                return newResult;
            });
        }).catch(err => {
            setSearchResult({
                ...getEmptySearchResult(searchConfig.query),
                hasError: true
            });
        }).finally(() => {
            setSearchIsRunning(false);
        })

    }, [searchConfig, dataProvider, firebaseContext, pageSize]);

    const toggleSearchHelpOpen = useCallback(() => {
        setHelpOpen(open => !open);
    }, []);

    const handleOnFocus = useCallback(() => {
        if (onResult) {
            onResult(searchResult);
        }
    }, [onResult, searchResult]);

    function handleChangeSettings(settings) {
        if (pushHistory ===  true) {
            pushSearchConfigHistory(history, searchConfig.query, settings);
        } else {
            setSearchConfig(oldConfig => {
                return {
                    ...oldConfig,
                    settings: { ...settings },
                    page: 0
                }
            });
        }
    }

    function setSearchQuery(newQuery) {
        if (pushHistory ===  true) {
            pushSearchConfigHistory(history, newQuery, searchConfig.settings);
        } else {
            setSearchConfig(oldConfig => {
                return {
                    ...oldConfig,
                    query: newQuery,
                    page: 0
                }
            })
        }
    }

    const handleNextPage = useCallback(() => {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                page: oldConfig.page + 1
            }
        })
    }, []);

    const handleOnExpandedChange = useCallback((expanded) => {
        if (onExpandedChange) {
            onExpandedChange(expanded);
        }
        if (!expanded) {
            // Clear search result
            setSearchResult(getInitialSearchResult());
            setSearchConfig(oldConfig => ({
                ...oldConfig,
                page: 0,
                query: ""
            }));
        }
    }, [onExpandedChange]);

    function onQueryChange(newQuery) {
        if (searchTimer.current !== null) {
            clearTimeout(searchTimer.current);
        }
        searchTimer.current = setTimeout(setSearchQuery, 500, newQuery.trim());
    }

    const GalleryComponent = galleryComponent;
    const NextPageComponent = nextPageComponent;

    return (
        <React.Fragment>
        <Box 
            ref={ref}
            sx={{
                '& > *': {
                    m: 0.5,
                },
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: alignItems,
                marginLeft: "auto",
                marginRight: "auto",
                ...(!expandable && {maxWidth: '700px' })
            }}
        >
            <SearchInput
                imageCount={imageCount}
                searchResult={searchResult}
                running={searchIsRunning}
                hasError={false}
                onChange={onQueryChange}
                onOpenHelp={toggleSearchHelpOpen}
                showResultCount={GalleryComponent === null}
                showHelp={showHelp}
                initialValue={searchConfig.query}
                expandable={expandable}
                resultsOpen={resultsOpen}
                onCloseResults={onCloseResults}
                onExpandedChange={handleOnExpandedChange}
                onFocus={handleOnFocus}
            />
            { 
                showExactSwitch && <SearchSettings settings={searchConfig.settings} onChange={handleChangeSettings} />
            }
        </Box>
        {
            GalleryComponent &&
            <React.Fragment>
                <SearchResult result={searchResult} />
                <GalleryComponent
                    images={searchResult.images}
                    count={searchResult.totalCount}
                    hasNext={searchResult.hasNext}
                    onNextPage={handleNextPage}
                />
            </React.Fragment>
        }
        {
            searchResult.hasNext && NextPageComponent &&
            <NextPageComponent
                onClick={handleNextPage}
                count={searchResult.images.length}
                loading={searchIsRunning}
            />
        }

        <LazyDialog title={t("helpTitle")} path={`search/help.${language}`} open={helpOpen} handleClose={toggleSearchHelpOpen} />

        </React.Fragment>
    );
});

export default Search;