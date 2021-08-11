import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@material-ui/core/styles';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import HelpIcon from '@material-ui/icons/Help';
import WarningIcon from '@material-ui/icons/Warning';

import { Gallery } from '../../components';
import PageTitle from '../../template/pageTitle';
import dataProvider from '../../dataProvider/dataprovider';
import { uniqueID } from '../../utils/utils';

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

function getEmptySearchResult() {
    return {
        images: [],
        hasNext: false,
        hasError: false
    }
}

const Search = () => {

    const [ searchTimer, setSearchTimer ] = useState(null);
    const [ searchIsRunning, setSearchIsRunning ] = useState(false);
    const [ searchResult, setSearchResult] = useState(getEmptySearchResult())
    const [ imageCount, setImageCount ] = useState(0);
    const [ searchConfig, setSearchConfig ] = useState({
        exact: false,
        pageIndex: 0,
        query: ""
    });

    const lastSearchProcessId = useRef(null);

    useEffect(() => {
        dataProvider.getImageCount().then(count => {
            setImageCount(count);
        });
    }, []);

    useEffect(() => {
        if (searchConfig.query.length <= 2)
        {
            setSearchResult(getEmptySearchResult());
            return;
        }

        setSearchIsRunning(true);

        lastSearchProcessId.current = uniqueID();

        dataProvider.searchImages(searchConfig.pageIndex, searchConfig.query, _pageSize, searchConfig.exact, lastSearchProcessId.current)
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
                    images: searchConfig.pageIndex === 0 ? results : oldResult.images.concat(results),
                    hasNext: _pageSize === results.length,
                    hasError: false
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
                pageIndex: 0
            }
        });
    }

    function handleNextPage() {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                pageIndex: oldConfig.pageIndex + 1
            }
        })
    }

    function setSearchQuery(query) {
        setSearchConfig(oldConfig => {
            return {
                ...oldConfig,
                query: query,
                pageIndex: 0
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
            <PageTitle>Recherche</PageTitle>
            <Box sx={{
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
                    running={searchIsRunning}
                    hasError={false}
                    onChange={onQueryChange}
                />
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
            </Box>
            <Gallery images={searchResult.images} style={{width: '100%'}} colWidth={300} margin={5}/>
            {
                searchResult.hasNext &&
                <Button
                    sx={{ mt: 3}}
                    variant="contained"
                    color="primary"
                    onClick={handleNextPage}>
                    En voir plus
                </Button>
            }
        </React.Fragment>
    );
};

export default Search;