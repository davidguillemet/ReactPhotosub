import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import { green, orange } from '@mui/material/colors';
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

import { uniqueID } from '../../utils';
import LazyDialog from '../../dialogs/LazyDialog';
import { useGlobalContext } from '../globalContext';
import { Paragraph } from '../../template/pageTypography';

const _pageSize = 10;


export function getInitialSearchResult() {
    return {
        images: [],
        hasNext: false,
        hasError: false,
        page: 0,
        totalCount: -1
    }
}

function getEmptySearchResult() {
    return {
        ...getInitialSearchResult(),
        totalCount: 0
    }
}

const SearcIconButton = styled(IconButton)(({theme}) => ({
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

const ResultStatus= ({searchResult}) => {
    const totalCount = searchResult.totalCount;
    if (searchResult.hasError === true) {
        return <WarningIcon sx={{ml: 1, color: orange[400]}} />
    } else if (totalCount >= 0) {
        return <Chip color="success" sx={{ml: 1, bgcolor: totalCount > 0 ? green[600] : orange[700]}} label={totalCount}></Chip>
    }

    return null;
}

const SearchInput = ({imageCount, searchResult, running, onChange, onOpenHelp, showResultCount}) => {

    return (
        <Paper component="form" sx={{
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
            <SearcIconButton disabled={true}>
                <StatusIcon searchIsRunning={running}/>
            </SearcIconButton>
            <InputBase
                sx={{
                    flex: 1,
                    ml: 1
                }}
                placeholder={imageCount !== undefined  ? `Rechercher parmi ${imageCount} images...` : ""}
                autoFocus={true}
                inputProps={{ 'aria-label': 'search google maps' }}
                fullWidth
                type="search"
                onChange={onChange}
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
            <SearcIconButton onClick={onOpenHelp}>
                <HelpIcon />
            </SearcIconButton>
        </Paper>
    );
}

const Search = React.forwardRef(({
    showExactSwitch = true,
    onResult = null,
    galleryComponent = null,
    nextPageComponent = null,
    pageIndex = 0}, ref) => {

    const context = useGlobalContext();
    const [ helpOpen, setHelpOpen ] = useState(false);
    const [ searchTimer, setSearchTimer ] = useState(null);
    const [ searchIsRunning, setSearchIsRunning ] = useState(false);
    const [ searchResult, setSearchResult] = useState(getInitialSearchResult())
    const [ searchConfig, setSearchConfig ] = useState({
        exact: false,
        page: 0,
        query: ""
    });
    const { data: imageCount } = context.useFetchImageCount();

    const lastSearchProcessId = useRef(null);

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
                    return getEmptySearchResult();
                }
                const aggegatedResults = searchConfig.page === 0 ? results : oldResult.images.concat(results);
                const newResult = {
                    images: aggegatedResults,
                    hasNext: aggegatedResults.length < response.totalCount,
                    hasError: false,
                    page: searchConfig.page,
                    totalCount: response.totalCount
                }
                return newResult;
            });
        }).catch(err => {
            setSearchResult({
                ...getEmptySearchResult(),
                hasError: true
            });
        }).finally(() => {
            setSearchIsRunning(false);
        })

    }, [searchConfig, context.dataProvider]);

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

    function setSearchQuery(query) {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                query: query,
                page: 0
            }
        })
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
        if (searchTimer !== null) {
            clearTimeout(searchTimer);
        }
        setSearchTimer(setTimeout(setSearchQuery, 500, event.target.value.trim()));
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
                    label="Rechercher les termes exacts"
                />
            }
        </Box>
        {
            GalleryComponent &&
            <React.Fragment>
                {
                    searchResult.totalCount >= 0 &&
                    <Paragraph>{`${searchResult.totalCount} Résultat(s)`}</Paragraph>
                }
                <GalleryComponent images={searchResult.images} />
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

        <LazyDialog title={"Rechercher des images"} path="search/help" open={helpOpen} handleClose={toggleSearchHelpOpen} />

        </React.Fragment>
    );
});

export default Search;