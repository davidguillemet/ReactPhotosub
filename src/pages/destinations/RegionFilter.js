import React, { useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';
import {unstable_batchedUpdates} from 'react-dom';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useLanguage, useTranslation, compareRegions, regionTitle } from 'utils';

const StyledListItem = styled('li')(({theme}) => ({
}));

const RegionFilterUI = ({hierarchy, onChange}) => {

    const { language } = useLanguage();
    const t = useTranslation("pages.destinations");
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
            noOptionsText={t("noRegion")}
            getOptionLabel={(option) => regionTitle(option, language)}
            defaultValue={[]}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={t("filterByRegions")}
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
                        label={regionTitle(option, language)}
                        clickable={true}
                        color={selected? 'primary' : 'default'}
                    />
                </StyledListItem>
            )}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        label={regionTitle(option, language)}
                        {...getTagProps({ index })}
                        disabled={index < tagValue.length - 1}
                    />
                ))
            }
            onChange={handleChange}
            value={filter}
        />
        <FormHelperText style={{ textAlign: "center" }}>{t("filterTip")}</FormHelperText>
        </React.Fragment>
    )
}

function buildRegionHierarchy(destinations, language) {
    const regionMap = new Map();
    destinations.forEach(destination => {
        destination.regionpath.forEach(region => {
            regionMap.set(region.id, region);
        });
    });
    return Array.from(regionMap.values()).sort(compareRegions(language));
}

const RegionFilter = ({destinations, onChange}) => {

    const { language } = useLanguage();
    const hierarchy = useMemo(() => buildRegionHierarchy(destinations, language), [destinations, language]);

    return <RegionFilterUI hierarchy={hierarchy} onChange={onChange} />
}

export default RegionFilter;