import React from 'react';
import { useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

const RegionFilter = ({hierarchy, onChange}) => {

    const [filter, setFilter] = useState([]);
    
    const handleChange = (event) => {
        const { target: { value } } = event;
        setFilter(value);
        if (onChange) {
            onChange(new Set(value.map(region => region.id)));
        }
    };

    const handleRemoveRegion = (clickedRegion) => {
        setFilter(prevFilter => {
            const newFilter = prevFilter.filter(region => region.id !== clickedRegion.id);
            onChange(new Set(newFilter.map(region => region.id)));
            return newFilter;
        })
    }

    return (
        <FormControl sx={{ m: 1, width: '95%', maxWidth: 700 }}>
            <InputLabel id="select-region-label">Filtrer par régions</InputLabel>
            <Select
                labelId="select-region-label"
                id="select-region"
                multiple
                MenuProps={{
                    MenuListProps: {
                        sx: {
                            maxWidth: 700,
                            px: 1,
                            py: 2
                        }
                    }
                }}
                autoWidth={true}
                value={filter}
                onChange={handleChange}
                input={<OutlinedInput id="select-region-input" label="Filtrer par régions" inputProps={{ height: '50px'}}/>}
                renderValue={(selected) => (
                    <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {selected.map((region) => (
                            <Chip
                                key={region.id}
                                label={region.title}
                                sx={{ m: '2px' }}
                                size="small"
                                deleteIcon={<CancelOutlinedIcon />}
                                onDelete={() => handleRemoveRegion(region)}
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                }}
                            />
                        ))}
                    </Box>
                )}
            >
            { hierarchy.map((region) => (
                <MenuItem
                    key={region.id}
                    value={region}
                    sx={{
                        width: 'auto',
                        float: 'left',
                        p: 0,
                        mx: 0.5,
                        mt: 0,
                        mb: 1,
                        borderRadius: '20px',
                        '&.Mui-selected, &.MuiMenuItem-root:hover, &.Mui-selected:hover': {
                            bgcolor: 'unset'
                        }
                    }}
                >
                    <Chip
                        label={region.title}
                        clickable={true}
                        color={filter.findIndex(item => region.id === item.id) !== -1 ? 'primary' : 'default'}
                    />
                </MenuItem>
            )) }
            </Select>
            <FormHelperText style={{ textAlign: "center" }}>
                Sélectionnez une ou plusieurs régions pour filtrer les destinations
            </FormHelperText>
        </FormControl>
    );
}

export default RegionFilter;