import React, { useCallback, useState, useMemo } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';

import {unstable_batchedUpdates} from 'react-dom';

import SimulationSplitButton from './SimulationSplitButton';
import SimulationNameDialog from './SimulationNameDlg';
import {isFromDb, isDirty} from '../../dataProvider';

import TooltipIconButton from '../../components/tooltipIconButton';

import {simulationHasName} from './actions/SimulationReducer';
import {
    setCurrentSimulationIndex,
    toggleLock
} from './actions/SimulationActions';


const SimulationToolBar = ({simulations, currentIndex, onSave, onAdd, onDelete, dispatch}) => {
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

    const onSelectionChange = (index) => {
        dispatch(setCurrentSimulationIndex(index));
    }

    const handleToggleLock = () => {
        dispatch(toggleLock(currentIndex));
    }

    return (
        <Paper
            sx={{
                width: '95%',
                maxWidth: 450,
                borderWidth: '1px',
                borderColor: 'text.disabled',
                borderStyle: 'solid',
                zIndex: 'app bar'
            }}
            elevation={0}
        >
            <SimulationNameDialog
                open={nameDlgOpen}
                action={action}
                validation={validateSimulationName}
                onOpenChanged={setNameDlgOpen}
                onValidate={action === "save" ? onSave : onAdd}
            />

            <Toolbar variant="dense">
                <TooltipIconButton
                    tooltip={`Sauvegarder "${simulation.name}"`}
                    onClick={handleSave}
                    disabled={isDirty(simulation) === false}
                    edge="start"
                >
                    <SaveOutlinedIcon />
                </TooltipIconButton>

                <TooltipIconButton
                    tooltip="Ajouter une simulation"
                    onClick={handleAdd}
                    edge="start"
                >
                    <AddOutlinedIcon />
                </TooltipIconButton>

                <TooltipIconButton
                    tooltip={simulation.isLocked ? `Déverrouiller "${simulation.name}"`: `Verrouiller "${simulation.name}"`}
                    onClick={handleToggleLock}
                    edge="start"
                >
                    {
                        simulation.isLocked ?
                        <LockOpenOutlinedIcon /> :
                        <LockOutlinedIcon />
                    }
                </TooltipIconButton>

                <SimulationSplitButton
                    simulations={simulations}
                    currentIndex={currentIndex}
                    onSelectionChange={onSelectionChange}
                />

                <TooltipIconButton
                    tooltip={`Supprimer "${simulation.name}"`}
                    onClick={handleDelete}
                    disabled={simulations.length === 1 && isFromDb(simulations[0]) === false}
                    style={{
                        marginLeft: 0,
                        marginRight: -12
                    }}
                    edge="start"
                >
                    <DeleteOutlineOutlinedIcon />
                </TooltipIconButton>

            </Toolbar>
        </Paper>
    );
};

export default SimulationToolBar;