import React, { useCallback, useState, useMemo } from 'react';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';

import {unstable_batchedUpdates} from 'react-dom';

import SimulationSplitButton from './SimulationSplitButton';
import SimulationNameDialog from './dialogs/SimulationNameDlg';
import SimulationDeletionDialog from './dialogs/SimulationDeletionDlg';
import {isFromDb, isDirty} from '../../dataProvider';

import TooltipIconButton from '../../components/tooltipIconButton';

import {simulationHasName} from './actions/SimulationReducer';
import { setCurrentSimulationIndex, toggleLock, rename } from './actions/SimulationActions';

const NAME_DIALOG_ACTION_NEW = "new";
const NAME_DIALOG_ACTION_SAVE = "save";
const NAME_DIALOG_ACTION_RENAME = "rename";

const SimulationToolBar = ({simulations, currentIndex, onSave, onAdd, onDelete, dispatch}) => {
    const [action, setAction] = useState(NAME_DIALOG_ACTION_SAVE);
    const [nameDlgOpen, setNameDlgOpen] = useState(false);
    const [deletionDlgOpen, setDeletionDlgOpen] = useState(false);

    const simulation = useMemo(() => simulations[currentIndex], [simulations, currentIndex]);

    const validateSimulationName = useCallback((name, action) => {
        if (name === null ) {
            return false;
        }
        const trimedName = name.trim();
        if (trimedName.length === 0) {
            return false;
        }
        const sameNameIndex = simulations.findIndex((simulation, index) => {
            return (action === NAME_DIALOG_ACTION_NEW || index !== currentIndex) && (simulation.name.toLowerCase() === trimedName.toLowerCase())
        });
        return (sameNameIndex < 0)
    }, [simulations, currentIndex]);

    const handleSave = () => {
        if (!simulationHasName(simulations[currentIndex])) {
            unstable_batchedUpdates(() => {
                setAction(NAME_DIALOG_ACTION_SAVE);
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
            setAction(NAME_DIALOG_ACTION_NEW);
            setNameDlgOpen(true);
        });
    }

    const onSelectionChange = (index) => {
        dispatch(setCurrentSimulationIndex(index));
    }

    const onRenameCurrent = useCallback(() => {
        // Open dialog to enter a name
        unstable_batchedUpdates(() => {
            setAction(NAME_DIALOG_ACTION_RENAME);
            setNameDlgOpen(true);
        });
    }, []);

    const handleToggleLock = () => {
        dispatch(toggleLock(currentIndex));
    }

    const onRename = (newName) => {
        dispatch(rename(newName, currentIndex));
    } 

    const getDialogCallback = (action) => {
        switch(action) {
            case NAME_DIALOG_ACTION_SAVE:
                return onSave;
            case NAME_DIALOG_ACTION_NEW:
                return onAdd;
            case NAME_DIALOG_ACTION_RENAME:
                return onRename;
            default:
                throw new Error(`Invalid action ${action}`);
        }
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
                onValidate={getDialogCallback(action)}
            />

            <SimulationDeletionDialog
                open={deletionDlgOpen}
                name={simulation.name}
                onOpenChanged={setDeletionDlgOpen}
                onValidate={handleDelete}
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
                    onRenameCurrent={onRenameCurrent}
                />

                <TooltipIconButton
                    tooltip={`Supprimer "${simulation.name}"`}
                    onClick={() => setDeletionDlgOpen(true)}
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