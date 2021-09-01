import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from '@material-ui/core/styles';
import { green, orange } from '@material-ui/core/colors';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import HelpIcon from '@material-ui/icons/Help';
import WarningIcon from '@material-ui/icons/Warning';

import dataProvider from '../../dataProvider/dataprovider';
import { uniqueID } from '../../utils';
import LazyDialog from '../../dialogs/LazyDialog';

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

const SearchInput = ({imageCount, searchResult, running, onChange, onOpenHelp}) => {

    return (
        <Paper component="form" sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',    
            py: '2px',
            px: '4px'
        }}>
            <SearcIconButton disabled={true}>
                <StatusIcon searchIsRunning={running}/>
            </SearcIconButton>
            <InputBase
                sx={{
                    flex: 1,
                    ml: 1
                }}
                placeholder={imageCount > 0  ? `Rechercher parmi ${imageCount} images...` : ""}
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
            <ResultStatus searchResult={searchResult} />
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

    const [ helpOpen, setHelpOpen ] = useState(false);
    const [ searchTimer, setSearchTimer ] = useState(null);
    const [ searchIsRunning, setSearchIsRunning ] = useState(false);
    const [ searchResult, setSearchResult] = useState(getInitialSearchResult())
    const [ imageCount, setImageCount ] = useState(0);
    const [ searchConfig, setSearchConfig ] = useState({
        exact: false,
        page: 0,
        query: ""
    });

    const lastSearchProcessId = useRef(null);

    useEffect(() => {
        dataProvider.getImageCount().then(count => {
            setImageCount(count);
        });
    }, []);

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

        dataProvider.searchImages(searchConfig.page, searchConfig.query, _pageSize, searchConfig.exact, lastSearchProcessId.current)
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
                const newResult = {
                    images: searchConfig.page === 0 ? results : oldResult.images.concat(results),
                    hasNext: _pageSize === results.length,
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

    }, [searchConfig]);

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

    function handleNextPage() {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                page: oldConfig.page + 1
            }
        })
    }

    function onQueryChange(event) {
        if (searchTimer !== null) {
            clearTimeout(searchTimer);
        }
        setSearchTimer(setTimeout(setSearchQuery, 500, event.target.value.trim()));
    }

    return (
        <React.Fragment>
        <Box 
            ref={ref}
            sx={{
                '& > *': {
                    m: 0.5,
                },
                width: '95%',
                maxWidth: '700px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <SearchInput
                imageCount={imageCount}
                searchResult={searchResult}
                running={searchIsRunning}
                hasError={false}
                onChange={onQueryChange}
                onOpenHelp={toggleSearchHelpOpen}
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
        {galleryComponent && React.cloneElement(galleryComponent, {images: searchResult.images})}
        {
            searchResult.hasNext && nextPageComponent && React.cloneElement(nextPageComponent, {onClick: handleNextPage, count: searchResult.images.length})
        }

        <LazyDialog title={"Rechercher des images"} path="search/help" open={helpOpen} handleClose={toggleSearchHelpOpen} />

        </React.Fragment>
    );
});

export default Search;