import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@material-ui/core/styles';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Box from "@material-ui/core/Box";
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import HelpIcon from '@material-ui/icons/Help';
import WarningIcon from '@material-ui/icons/Warning';

import dataProvider from '../../dataProvider/dataprovider';
import { uniqueID, getEmptySearchResult } from '../../utils/utils';

const _pageSize = 10;

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

const SearchInput = ({imageCount, running, hasError, onChange}) => {

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
            {
                hasError &&
                <SearcIconButton>
                    <WarningIcon />
                </SearcIconButton>
            }
            <Divider
                sx={{
                    height: '28px',
                    m: '4px'
                }}
                orientation="vertical"
            />
            <SearcIconButton>
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

    const [ searchTimer, setSearchTimer ] = useState(null);
    const [ searchIsRunning, setSearchIsRunning ] = useState(false);
    const [ searchResult, setSearchResult] = useState(getEmptySearchResult())
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
            setSearchResult(getEmptySearchResult());
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
            //     processId: <string>
            // }
            setSearchResult(oldResult => {
                const results = response.items;
                const newResult = {
                    images: searchConfig.page === 0 ? results : oldResult.images.concat(results),
                    hasNext: _pageSize === results.length,
                    hasError: false,
                    page: searchConfig.page
                }
                return newResult;
            });
        }).catch(err => {
            // TODO display error message
        }).finally(() => {
            setSearchIsRunning(false);
        })

    }, [searchConfig]);

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
        <div ref={ref} style={{
            width: '95%',
            maxWidth: '700px',
        }}>
        <Box sx={{
                '& > *': {
                    m: 0.5,
                },
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <SearchInput
                imageCount={imageCount}
                running={searchIsRunning}
                hasError={false}
                onChange={onQueryChange}
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
        </div>
    );
});

export default Search;