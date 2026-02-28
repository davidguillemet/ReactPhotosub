import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// filepath: /Users/davidguillemet/Documents/Dvt/React/photosub/src/components/input/AutoCompleteTagInput.js

const StyledListItem = styled('li')(({ theme }) => ({}));

const AutoCompleteTagInput = ({
    id = 'autoCompleteInput',
    placeholder = '',
    options = [],
    onChange,
    helperText,
    noOptionsText,
    enableLastSelected = true
}) => {
    const [filter, setFilter] = useState([]);

    const handleChange = (event, newValue) => {
        setFilter(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <React.Fragment>
            <Autocomplete
                id={id}
                sx={{ width: '100%' }}
                slotProps={{
                    listbox: {
                        sx: {
                            p: 1,
                            maxHeight: '100vh',
                            '& .MuiAutocomplete-option': {
                                p: { xs: 0 },
                                minHeight: { xs: 0 },
                            },
                            '& .MuiAutocomplete-option:hover': { bgcolor: 'unset' },
                            '& .MuiAutocomplete-option[aria-selected="true"]': { bgcolor: 'unset' },
                            '& .MuiAutocomplete-option[aria-selected="true"]:hover': { bgcolor: 'unset' },
                        },
                    },
                }}
                multiple
                disableCloseOnSelect
                filterSelectedOptions={false}
                options={options}
                noOptionsText={noOptionsText}
                getOptionLabel={(option) => option.label}
                defaultValue={[]}
                renderInput={(params) => <TextField {...params} label={placeholder} />}
                renderOption={(props, option, { selected }) => (
                    <StyledListItem
                        {...props}
                        key={option.id}
                        value={option}
                        sx={{ width: 'auto', float: 'left', p: { xs: 0 }, m: { xs: 0.5 } }}
                    >
                        <Chip
                            label={option.label}
                            clickable={true}
                            color={selected ? 'primary' : 'default'}
                        />
                    </StyledListItem>
                )}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                        const tagProps = getTagProps({ index });
                        const { key, ...otherProps } = tagProps;
                        return (
                            <Chip
                                key={key}
                                {...otherProps}
                                label={option.label}
                                disabled={enableLastSelected && index < tagValue.length - 1}
                            />)
                    })
                }
                onChange={handleChange}
                value={filter}
            />
            {helperText && (
                <FormHelperText style={{ textAlign: 'left', paddingLeft: 16 }}>
                    {helperText}
                </FormHelperText>
            )}
        </React.Fragment>
    );
};

export default AutoCompleteTagInput;