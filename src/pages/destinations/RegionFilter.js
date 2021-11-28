import React, { useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';
import {unstable_batchedUpdates} from 'react-dom';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { withLoading, buildLoadingState } from '../../components/loading';

const StyledListItem = styled('li')(({theme}) => ({
}));

const RegionFilterUI = ({hierarchy, onChange}) => {

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
            const regionSet = new Set();
            // Add the last element only
            if (newValue.length > 0) {
                regionSet.add(newValue[newValue.length - 1].id);
            }
            onChange(regionSet);
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
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        label={option.title}
                        {...getTagProps({ index })}
                        disabled={index < tagValue.length - 1}
                    />
                ))
            }
            onChange={handleChange}
            value={filter}
        />
        <FormHelperText style={{ textAlign: "center" }}>
            Sélectionnez une ou plusieurs régions pour filtrer les destinations
        </FormHelperText>
        </React.Fragment>
    )
}

function removeUnusedRegions (initialHierarchy, regionsByDestination) {

    // Build a Set that contains all destination regions:
    const regionSet = new Set();
    regionsByDestination.forEach((regions, key, map) => {
        regions.forEach((region) => {
            regionSet.add(region.id);
        })
    });

    const finalHierarchy = [];
    initialHierarchy.forEach(region => {
        if (regionSet.has(region.id)) {
            finalHierarchy.push(region)
        }
    });

    return finalHierarchy;
}

const RegionFilter = ({hierarchy, onChange, regionsByDestination}) => {

    const consolidatedHierarchy = useMemo(() => removeUnusedRegions(hierarchy, regionsByDestination), [hierarchy, regionsByDestination]);

    return <RegionFilterUI hierarchy={consolidatedHierarchy} onChange={onChange} />
}

export default withLoading(RegionFilter, [buildLoadingState("regionsByDestination", null)]);