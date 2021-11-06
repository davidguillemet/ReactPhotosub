import React from 'react';
import {isMobile} from 'react-device-detect';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';

import { isFromDb, isDirty } from '../../dataProvider';

const DirtyIcon = ({simulation}) => {
    return isDirty(simulation) === false ?
            null :
            isFromDb(simulation) ?
            <ErrorOutlineIcon fontSize="small" /> :
            <NewReleasesOutlinedIcon fontSize="small" />;
}

const SimulationSplitButton = ({simulations, currentIndex, onSelectionChange}) => {

    const handleChange = (event) => {
        onSelectionChange(event.target.value);
    };

    const splitButtonDisabled = simulations.length === 0 || (simulations.length === 1 && isFromDb(simulations[0]) === false);
    const selectMaxWidth = 450;

    return (
        <FormControl sx={{ m: 1, width: '95%', maxWidth: selectMaxWidth }}>
            <Select
                value={currentIndex}
                onChange={handleChange}
                disabled={splitButtonDisabled}
                sx={{
                    "& .MuiListItemText-primary": {
                        textOverflow: "ellipsis",
                        overflow: "hidden"
                    },
                    "& .MuiOutlinedInput-input": {
                        display: "flex",
                        alignItems: "center"
                    },
                    "& .MuiListItemIcon-root": {
                        minWidth: "unset"
                    }
                }}
            >
                {
                    simulations.map((simulation, index) => (
                        <MenuItem
                            value={index}
                            key={index}
                            sx={{
                                maxWidth: selectMaxWidth,
                                "& .MuiListItemText-primary": {
                                    textOverflow: "ellipsis",
                                    overflow: "hidden"
                                }
                            }}
                        >
                            <ListItemText primary={simulation.name}/>
                            {
                                isDirty(simulation) &&
                                <ListItemIcon sx={{ ml: 1 }}>
                                    <DirtyIcon simulation={simulation} />
                                </ListItemIcon>            
                            }
                        </MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    );
};

export default SimulationSplitButton;
