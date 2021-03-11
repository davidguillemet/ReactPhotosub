import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';

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
    }
}));

const Search = () => {
    
    const [ searchTimer, setSearchTimer ] = useState(null);
    const [ searchIsRunning, setSearchIsRunning ] = useState(false);
    const [ imageCount, setImageCount ] = useState(0);
    const [ searchExact, setSearchExact ] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        getImageCount().then(count => {
            setImageCount(count);
        });
    }, []);

    function getImageCount() {
        return fetch("/api/images")
        .then((response) => {
            return response.json();
        }).then((data) => {
            return data.count;
        }).catch(err => {
            return "XX";
        });
    }

    function onChange(event) {
        if (searchTimer !== null) {
            clearTimeout(searchTimer);
        }
        // TODO: can we update the input field icon with a spinner?
        //updateSearchIndicator(false)
        setSearchTimer(setTimeout(runSearch, 500, 0, event.target.value));
    }

    function runSearch(pageIndex, searchQuery) {
        setSearchIsRunning(true);
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
            setSearchIsRunning(false);
        })
    }

    function StatusIcon(){
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

    function handleChangeExact(event) {
        setSearchExact(event.target.checked);
    }
    
    return (
        <Box classes={{
                root: classes.root
            }}>
            <Typography variant="h5" component="h1">
            Saisissez un critère pour lancer une recherche
            </Typography>
            <Button variant="contained" color="primary" href="#contained-buttons">Guide de la recherche</Button>
            <TextField 
                className={classes.noMargin}
                id="filled-search"
                label="Recherche"
                placeholder={`Rechercher parmi ${imageCount} images...`}
                variant="outlined"
                autoFocus={true}
                size="medium"
                fullWidth
                type="search"
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <StatusIcon />
                    </InputAdornment>
                    ),
                }}
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
    );
};

export default Search;