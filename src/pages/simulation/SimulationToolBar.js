import React, { useCallback, useState, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import {unstable_batchedUpdates} from 'react-dom';

import SimulationSplitButton from './SimulationSplitButton';
import SimulationNameDialog from './SimulationNameDlg';
import {isFromDb, isDirty} from '../../dataProvider';

import {simulationHasName} from './actions/SimulationReducer';

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

const SimulationToolBar = ({simulations, currentIndex, onSave, onAdd, onDelete, onSelectionChange}) => {
    const [action, setAction] = useState("save");
    const [nameDlgOpen, setNameDlgOpen] = useState(false);

    const simulation = useMemo(() => simulations[currentIndex], [simulations, currentIndex]);

    const validateSimulationName = useCallback((name, action) => {
        const sameNameIndex = simulations.findIndex((simulation, index) => {
            return (action === "new" || index !== currentIndex) && (simulation.name.toLowerCase() === name.toLowerCase())
        });
        return (sameNameIndex < 0)
    }, [simulations, currentIndex]);

    const handleSave = () => {
        if (!simulationHasName(simulations[currentIndex])) {
            unstable_batchedUpdates(() => {
                setAction("save");
                setNameDlgOpen(true);
            });
        } else {
            onSave();
        }
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        }
    }

    const handleAdd = () => {
        // Open dialog to enter a name
        unstable_batchedUpdates(() => {
            setAction("new");
            setNameDlgOpen(true);
        });
    }

    return (
        <Paper style={{
            position: "fixed",
            top: 5,
            zIndex: 99999
        }}>
            <SimulationNameDialog
                open={nameDlgOpen}
                action={action}
                defaultValue=""
                validation={validateSimulationName}
                onOpenChanged={setNameDlgOpen}
                onValidate={action === "save" ? onSave : onAdd}
            />

            <Toolbar variant="dense">
                <ButtonWithTooltip tooltip={`Sauvegarder "${simulation.name}"`} onClick={handleSave} disabled={isDirty(simulation) === false}>
                    <SaveOutlinedIcon />
                </ButtonWithTooltip>

                <ButtonWithTooltip tooltip={`Supprimer "${simulation.name}"`} onClick={handleDelete} disabled={simulations.length === 1 && isFromDb(simulations[0]) === false}>
                    <DeleteOutlineOutlinedIcon />
                </ButtonWithTooltip>

                <ButtonWithTooltip tooltip="Ajouter une simulation" onClick={handleAdd} >
                    <AddOutlinedIcon />
                </ButtonWithTooltip>

                <SimulationSplitButton
                    simulations={simulations}
                    currentIndex={currentIndex}
                    onSelectionChange={onSelectionChange}
                />
            </Toolbar>
        </Paper>
    );
};

export default SimulationToolBar;