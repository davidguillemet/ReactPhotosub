import React, { useState, useEffect, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';

const useStyle = makeStyles((theme) => ({
    buttonLabel: {
        textTransform: 'none',
    }
}));

const SimulationSplitButtonItem = ({simulation, index, selected, onClick}) => {

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
        </MenuItem>
    );
};

const SimulationSplitButton = ({simulations, currentIndex, dirty, onSelectionChange}) => {
    const classes = useStyle();

    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(currentIndex);

    useEffect(() => {
        setSelectedIndex(currentIndex)
    }, [currentIndex]);

    const handleMenuItemClick = useCallback((simulationIndex) => {
        setSelectedIndex(simulationIndex)
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

    const handleDeleteCurrent = () => {
        // TODO
    }

    const handleRenameCurrent= () => {
        // TODO
    }

    function getCurrentSimulationCaption() {
        if (simulations.length === 0 || selectedIndex < 0) {
            return "Pas de simulation enregistrée";
        }

        return simulations[selectedIndex].name + (dirty ? " *" : "")
    }

    const splitButtonDisabled = simulations.length === 0 || (simulations.length === 1 && selectedIndex < 0);

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
                    >
                        {getCurrentSimulationCaption()}
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
                                                selected={index === selectedIndex}
                                                onClick={handleMenuItemClick}
                                            />
                                        ))}
                                        <Divider />
                                        {
                                            simulations.length > 0 && selectedIndex >= 0 &&
                                            <React.Fragment>
                                            {
                                                dirty &&
                                                <MenuItem onClick={handleSaveNew}>{`Enregistrer "${simulations[selectedIndex].name}" en tant que nouvelle simulation`}</MenuItem>
                                            }
                                            <MenuItem onClick={handleDeleteCurrent}>{`Supprimer la simulation "${simulations[selectedIndex].name}"`}</MenuItem>
                                            <MenuItem onClick={handleRenameCurrent}>{`Renommer la simulation "${simulations[selectedIndex].name}"`}</MenuItem>
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
