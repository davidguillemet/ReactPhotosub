import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { green, orange, red } from '@mui/material/colors';
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';

import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import HelpIcon from '@mui/icons-material/Help';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

import { uniqueID, useTranslation, useLanguage } from '../../utils';
import LazyDialog from '../../dialogs/LazyDialog';
import { useGlobalContext } from '../globalContext';
import { Paragraph } from '../../template/pageTypography';
import { useStateWithDep } from '../hooks';
import ErrorAlert from '../error';
import { useFirebaseContext } from '../firebase';

const _pageSize = 10;

export function getInitialSearchResult() {
    return {
        images: [],
        hasNext: false,
        hasError: false,
        query: "",
        page: 0,
        totalCount: -1
    }
}

function getEmptySearchResult(query) {
    return {
        ...getInitialSearchResult(),
        query: query,
        totalCount: 0
    }
}

const SearchIconButton = styled(IconButton)(({theme}) => ({
    padding: 10
}));

const StatusIcon = ({searchIsRunning}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: 24,
            height: 24
        }}>
            {
                searchIsRunning === true ?
                <CircularProgress size={20} /> :
                <SearchIcon size={20}></SearchIcon>
            }
        </div>
    );
}

const ResultStatus = ({searchResult}) => {
    const totalCount = searchResult.totalCount;
    if (searchResult.hasError === true) {
        return <ErrorIcon sx={{ml: 1, color: red[400]}} />
    } else if (totalCount === 0) {
        return <WarningIcon sx={{ml: 1, color: orange[400]}} />
    } else if (totalCount > 0) {
        return <Chip color="success" sx={{ml: 1, bgcolor: totalCount > 0 ? green[600] : orange[700]}} label={totalCount}></Chip>
    }

    return null;
}

const SearchInput = ({imageCount, searchResult, running, onChange, onOpenHelp, showResultCount, initialValue}) => {

    const t = useTranslation("components.search");
    const [value, setValue] = useStateWithDep(initialValue);

    const onValueChange = useCallback((event) => {
        setValue(event.target.value);
        onChange(event)
    }, [onChange, setValue])

    return (
        <Paper sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: theme => theme.palette.divider,
            py: '2px',
            px: '4px',
            m: 0
        }}>
            <SearchIconButton disabled={true}>
                <StatusIcon searchIsRunning={running}/>
            </SearchIconButton>
            <InputBase
                sx={{
                    flex: 1,
                    ml: 1
                }}
                placeholder={imageCount !== undefined  ? t("inputPlaceHolder", imageCount) : ""}
                autoFocus={true}
                fullWidth
                type="search"
                onChange={onValueChange}
                value={value}
            />
            <Divider
                sx={{
                    height: '28px',
                    m: '4px'
                }}
                orientation="vertical"
            />
            {
                showResultCount &&
                <ResultStatus searchResult={searchResult} />
            }
            <SearchIconButton onClick={onOpenHelp}>
                <HelpIcon />
            </SearchIconButton>
        </Paper>
    );
}

const Search = React.forwardRef(({
    showExactSwitch = true,
    onResult = null,
    galleryComponent = null,
    nextPageComponent = null,
    query = null,
    pushHistory = false,
    pageIndex = 0}, ref) => {

    const t = useTranslation("components.search");
    const { language } = useLanguage();
    const history = useHistory();
    const context = useGlobalContext();
    const firebaseContext = useFirebaseContext();
    const [ helpOpen, setHelpOpen ] = useState(false);
    const [ searchIsRunning, setSearchIsRunning ] = useState(false);
    const [ searchResult, setSearchResult] = useState(getInitialSearchResult())
    const [ searchConfig, setSearchConfig ] = useState({
        exact: false,
        page: 0,
        query: query || ""
    });
    const { data: imageCount } = context.useFetchImageCount();
    const searchTimer = useRef(null);

    const lastSearchProcessId = useRef(null);

    useEffect(() => {
        setSearchConfig(prevConfig => {
            return {
                exact: prevConfig.exact,
                page: 0,
                query: query || ""
            }
        })
    }, [query]);

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

        context.dataProvider.searchImages(searchConfig.page, searchConfig.query, _pageSize, searchConfig.exact, lastSearchProcessId.current)
        .then(response => {
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

    }, [searchConfig, context, firebaseContext]);

    const toggleSearchHelpOpen = useCallback(() => {
        setHelpOpen(open => !open);
    }, []);

    function handleChangeExact(event) {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                exact: event.target.checked,
                page: 0
            }
        });
    }

    function setSearchQuery(newQuery) {
        if (pushHistory ===  true) {
            history.push({
                pathname: '/search',
                search: '?' + new URLSearchParams({query: newQuery}).toString()
            })
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

    function onQueryChange(event) {
        if (searchTimer.current !== null) {
            clearTimeout(searchTimer.current);
        }
        searchTimer.current = setTimeout(setSearchQuery, 500, event.target.value.trim());
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
                maxWidth: '700px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: "auto",
                marginRight: "auto"
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
                initialValue={searchConfig.query}
            />
            { 
                showExactSwitch && 
                <FormControlLabel
                    control={
                        <Switch
                            checked={searchConfig.exact}
                            onChange={handleChangeExact}
                            name="checkedExact"
                            color="primary"
                    />}
                    label={t("exactSwitch")}
                />
            }
        </Box>
        {
            GalleryComponent &&
            <React.Fragment>
                {
                    searchResult.hasError ? <ErrorAlert /> :
                    searchResult.totalCount >= 0 && <Paragraph>{t("resultsCount", searchResult.totalCount)}</Paragraph>
                }
                <GalleryComponent
                    images={searchResult.images}
                    count={searchResult.totalCount}
                    hasNext={searchResult.hasNext}
                    onNextPage={handleNextPage} />
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