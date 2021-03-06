import React, { useState, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import NewReleasesOutlinedIcon from '@material-ui/icons/NewReleasesOutlined';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';

import { isFromDb, isDirty } from '../../dataProvider';

const useStyle = makeStyles((theme) => ({
    buttonLabel: {
        textTransform: 'none',
    },
    dirtyIcon: {
        marginLeft: theme.spacing(1)
    }
}));

const DirtyIcon = ({simulation}) => {
    return isDirty(simulation) === false ?
            null :
            isFromDb(simulation) ?
            <ErrorOutlineIcon fontSize="small" /> :
            <NewReleasesOutlinedIcon fontSize="small" />;
}

const SimulationSplitButtonItem = ({simulation, index, selected, onClick}) => {

    const classes = useStyle();

    const handleMenuItemClick = useCallback(() => {
        onClick(index)
    }, [index, onClick]);

    return (
        <MenuItem
            key={simulation.id}
            disabled={false}
            selected={selected}
            onClick={handleMenuItemClick}
        >
            {simulation.name}
            {
                isDirty(simulation) &&
                <ListItemIcon className={classes.dirtyIcon}>
                    <DirtyIcon simulation={simulation} />
                </ListItemIcon>            
            }
        </MenuItem>
    );
};

const SimulationSplitButton = ({simulations, currentIndex, onSelectionChange}) => {
    const classes = useStyle();

    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const simulation = simulations[currentIndex];

    const handleMenuItemClick = useCallback((simulationIndex) => {
        onSelectionChange(simulationIndex);
        setOpen(false);
    }, [onSelectionChange]);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    }

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
          return;
        }
        setOpen(false);
    };

    const handleSaveNew = () => {
        // TODO
    };

    const handleRenameCurrent= () => {
        // TODO
    }

    const splitButtonDisabled = simulations.length === 0 || (simulations.length === 1 && isFromDb(simulations[0]) === false);

    return (
        <Grid container direction="column" alignItems="center">
            <Grid item xs={12}>
                <ButtonGroup variant="contained" color="secondary" ref={anchorRef} aria-label="split button">
                    <Button
                        onClick={handleToggle}
                        classes={{
                            label: classes.buttonLabel
                        }}
                        disabled={splitButtonDisabled}
                        endIcon={<DirtyIcon simulation={simulation} />}
                    >
                        {simulations[currentIndex].name}
                    </Button>
                    <Button
                        color="secondary"
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                        disabled={splitButtonDisabled}
                    >
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu">
                                        {simulations.map((simulation, index) => (
                                            <SimulationSplitButtonItem
                                                key={index}
                                                simulation={simulation}
                                                index={index}
                                                selected={index === currentIndex}
                                                onClick={handleMenuItemClick}
                                            />
                                        ))}
                                        <Divider />
                                        {
                                            simulations.length > 0 && currentIndex >= 0 &&
                                            <React.Fragment>
                                            {
                                                isDirty(simulation) &&
                                                <MenuItem onClick={handleSaveNew}>{`Enregistrer "${simulations[currentIndex].name}" en tant que nouvelle simulation`}</MenuItem>
                                            }
                                            <MenuItem onClick={handleRenameCurrent}>{`Renommer la simulation "${simulations[currentIndex].name}"`}</MenuItem>
                                            </React.Fragment>
                                        }
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Grid>
        </Grid>
    );
};

export default SimulationSplitButton;
