import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import SimulationSplitButton from './SimulationSplitButton';
import SimulationNameDialog from './SimulationNameDlg';

const useTooltipButtonStyles = makeStyles((theme) => ({
    tooltipLabel: {
        fontSize: 16
    },
    tooltipPlacementBottom: {
        backgroundColor: 'black',
        top: 15
    },
    arrow: {
        color: 'black',
    },
    menuButton: {
        marginRight: theme.spacing(0),
      },
  }));


const ButtonWithTooltip = ({tooltip, onClick, disabled, children}) => {

    const classes = useTooltipButtonStyles();

    return (
        <Tooltip
            title={tooltip}
            placement="bottom"
            TransitionComponent={Zoom}
            arrow
            classes={{
                tooltip: classes.tooltipLabel,
                tooltipPlacementBottom: classes.tooltipPlacementBottom,
                arrow: classes.arrow
            }}
        >
            <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
                onClick={onClick}
                disabled={disabled}
            >
                {children}
            </IconButton>
        </Tooltip>
    );
}

const SimulationToolBar = ({simulations, currentIndex, dirty, onSave, onDelete}) => {
    const [currentSimulationIndex, setCurrentSimulationIndex] = useState(currentIndex);
    const [isDirty, setIsDirty] = useState(dirty);
    const [nameDlgOpen, setNameDlgOpen] = useState(false);

    useEffect(() => {
        setIsDirty(dirty);
    }, [dirty]);

    useEffect(() => {
        setCurrentSimulationIndex(currentIndex);
    }, [currentIndex])

    const getSimulationName = useCallback(() => {
        if (simulations.length === 0 || currentSimulationIndex < 0) {
            return "la simulation courante";
        }

        return `"${simulations[currentSimulationIndex].name}"`;

    }, [simulations, currentSimulationIndex]);

    const validateSimulationName = useCallback(name => {
        const sameNameIndex = simulations.findIndex(simulation => simulation.name && simulation.name.toLower() === name);
        if (sameNameIndex < 0) {
            return true;
        }
        if (currentIndex === -1) {
            // new simulation has the same name as an existing one
            return false;
        }
        // The name is valid only if the simulation with the same name is the same
        return (currentIndex === sameNameIndex);

    }, [simulations, currentIndex]);

    const handleSave = () => {
        if (currentIndex === - 1) {
            setNameDlgOpen(true);
        } else {
            onSave();
        }
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        }
    }

    const simulationName = getSimulationName();

    return (
        <Paper style={{
            position: "fixed",
            top: 5,
            zIndex: 99999
        }}>
            <SimulationNameDialog
                open={nameDlgOpen}
                action="save"
                defaultValue=""
                validation={validateSimulationName}
                onOpenChanged={setNameDlgOpen}
                onValidate={onSave}
            />
            <Toolbar variant="dense">
                <ButtonWithTooltip tooltip={`Sauvegarder ${simulationName}`} onClick={handleSave} disabled={currentIndex >= 0 && isDirty === false}>
                    <SaveOutlinedIcon />
                </ButtonWithTooltip>

                <ButtonWithTooltip tooltip={`Supprimer ${simulationName}`} onClick={handleDelete} disabled={simulations.length === 0}>
                    <DeleteOutlineOutlinedIcon />
                </ButtonWithTooltip>

                <ButtonWithTooltip tooltip="Ajouter une simulation" onClick={null /* TODO */} disabled={currentIndex === -1}>
                    <AddOutlinedIcon />
                </ButtonWithTooltip>

                <SimulationSplitButton
                    simulations={simulations}
                    currentIndex={currentSimulationIndex}
                    dirty={isDirty}
                    onSelectionChange={setCurrentSimulationIndex}
                />
            </Toolbar>
        </Paper>
    );
};

export default SimulationToolBar;