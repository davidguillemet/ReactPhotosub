import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Box from "@material-ui/core/Box";
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import HelpIcon from '@material-ui/icons/Help';
import WarningIcon from '@material-ui/icons/Warning';

import dataProvider from '../../dataProvider';

const useStyles = makeStyles((theme) => ({
    noMargin: {
      margin: 0,//theme.spacing(1),
    },
    root: {
        '& > *': {
          margin: theme.spacing(0.5),
        },
        width: '95%',
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    resultContainer: {
        display: 'flex',
        width: '100%',
        marginTop: theme.spacing(3)
    }
}));

const useSearchInputStyle = makeStyles((theme) => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
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

const SearchInput = ({imageCount, status, onChange}) => {

    const classes = useSearchInputStyle();

    return (
        <Paper component="form" className={classes.root}>
        <IconButton className={classes.iconButton} aria-label="menu">
            <StatusIcon searchIsRunning={status.running}/>
        </IconButton>
        <InputBase
            className={classes.input}
            placeholder={`Rechercher parmi ${imageCount} images...`}
            autoFocus={true}
            inputProps={{ 'aria-label': 'search google maps' }}
            fullWidth
            type="search"
            onChange={onChange}
        />
        {
            status.hasError &&
            <IconButton className={classes.iconButton} aria-label="search">
                <WarningIcon />
            </IconButton>
        }
        <Divider className={classes.divider} orientation="vertical" />
        <IconButton className={classes.iconButton} aria-label="directions">
            <HelpIcon />
        </IconButton>
      </Paper>
    );
}

const Search = () => {
    
    const [ searchTimer, setSearchTimer ] = useState(null);
    const [ searchStatus, setSearchStatus ] = useState({
        running: false,
        hasError: false
    });
    const [ imageCount, setImageCount ] = useState(0);
    const [ searchExact, setSearchExact ] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        dataProvider.getImageCount().then(count => {
            setImageCount(count);
        });
    }, []);

    function onChange(event) {
        if (searchTimer !== null) {
            clearTimeout(searchTimer);
        }
        setSearchTimer(setTimeout(runSearch, 500, 0, event.target.value));
    }

    function runSearch(pageIndex, searchQuery) {
        setSearchStatus({
            ...searchStatus,
            running: true
        });
        return axios.post("/api/search", {
            page: pageIndex,
            pageSize: 10,
            exact: searchExact,
            query: searchQuery
        }).then(response => {
            const results = response.data;
            console.log(results);
        }).catch(err => {
            // TODO display error message
        }).finally(() => {
            setSearchStatus({
                ...searchStatus,
                running: false
            });
        })
    }

    function handleChangeExact(event) {
        setSearchExact(event.target.checked);
    }
    
    return (
        <React.Fragment>
            <Typography variant="h2">Recherche</Typography>
            <Box classes={{
                    root: classes.root
                }}>
                <SearchInput
                    imageCount={imageCount}
                    status={searchStatus}
                    onChange={onChange}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={searchExact}
                            onChange={handleChangeExact}
                            name="checkedExact"
                            color="primary"
                    />}
                    label="Rechercher les termes exacts"
                />
            </Box>
            <Box className={classes.resultContainer}>
                Résultat
            </Box>
        </React.Fragment>
    );
};

export default Search;