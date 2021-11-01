import React, { useEffect } from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';
import {unstable_batchedUpdates} from 'react-dom';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const StyledListItem = styled('li')(({theme}) => ({
}));

const RegionFilter = ({hierarchy, onChange}) => {

    const [filter, setFilter] = useState([]);
    const [options, setOptions] = useState([]);
    
    useEffect(() => {
        setOptions(hierarchy.filter(region => region.parent === null));
    }, [hierarchy]);

    const handleChange = (event, newValue) => {
        unstable_batchedUpdates(() => {
            setFilter(newValue);
            const parentId = newValue.length > 0 ? newValue[newValue.length - 1].id : null;
            setOptions(hierarchy.filter(region => region.parent === parentId))
        });
        if (onChange) {
            onChange(new Set(newValue.map(region => region.id)));
        }
    };

    return (
        <React.Fragment>
        <Autocomplete
            id='regionSelector'
            sx={{
                width: '95%',
                maxWidth: 700,
            }}
            ListboxProps={{
                sx: {
                    p: 1,
                    maxHeight: '100vh',
                    '& .MuiAutocomplete-option': {
                        p: {
                            xs: 0,
                        },
                        minHeight: {
                            xs: 0
                        }
                    },
                    '& .MuiAutocomplete-option:hover': {
                        bgcolor: 'unset'
                    },
                    '& .MuiAutocomplete-option[aria-selected="true"]': {
                        bgcolor: 'unset'
                    },
                    '& .MuiAutocomplete-option[aria-selected="true"]:hover': {
                        bgcolor: 'unset'
                    }
                }
            }}
            multiple
            disableCloseOnSelect
            filterSelectedOptions={false}
            options={options}
            noOptionsText='Aucune région...'
            getOptionLabel={(option) => option.title}
            defaultValue={[]}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Filtrer par régions"
                />
            )}
            renderOption={(props, option, { selected }) => (
                <StyledListItem {...props}
                    key={option.id}
                    value={option}
                    sx={{
                        width: 'auto',
                        float: 'left',
                        p: {
                            xs: 0
                        },
                        m: {
                            xs: 0.5
                        }
                    }}
                >
                    <Chip
                        label={option.title}
                        clickable={true}
                        color={selected? 'primary' : 'default'}
                    />
                </StyledListItem>
            )}
            onChange={handleChange}
            value={filter}
        />
        <FormHelperText style={{ textAlign: "center" }}>
            Sélectionnez une ou plusieurs régions pour filtrer les destinations
        </FormHelperText>
        </React.Fragment>
    )
}

export default RegionFilter;