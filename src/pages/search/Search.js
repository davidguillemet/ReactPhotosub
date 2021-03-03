import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
    margin: {
      margin: theme.spacing(1),
    },
}));

const Search = () => {
    
    const [ searchTimer, setSearchTimer] = useState(null);
    const [ imageCount, setImageCount] = useState(0);
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

    function runSearch(pageIndex, value) {
        // TODO call the search API
    }
    
    return (
        <div>
            <TextField 
                className={classes.margin}
                id="filled-search"
                label="Recherche"
                placeholder={`Rechercher parmi ${imageCount} images...`}
                variant="outlined"
                autoFocus={true}
                size="medium"
                style={{
                    width: '95%',
                    maxWidth: '700px'
                }}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                    ),
                }}
                onChange={onChange}/>
        </div>
    );
};

export default Search;