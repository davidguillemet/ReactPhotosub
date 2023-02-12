import React, { useCallback, useState, useMemo } from 'react';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import Divider from '@mui/material/Divider';

import {unstable_batchedUpdates} from 'react-dom';

import SimulationSplitButton from './SimulationSplitButton';
import SimulationNameDialog from './dialogs/SimulationNameDlg';
import SimulationDeletionDialog from './dialogs/SimulationDeletionDlg';
import {isFromDb, isDirty} from '../../dataProvider';

import TooltipIconButton from '../../components/tooltipIconButton';

import {simulationHasName} from './actions/SimulationReducer';
import { setCurrentSimulationIndex, toggleLock, rename } from './actions/SimulationActions';
import { withLoading, buildLoadingState, withUser } from '../../components/hoc';

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
        const trimmedName = name.trim();
        if (trimmedName.length === 0) {
            return false;
        }
        const sameNameIndex = simulations.findIndex((simulation, index) => {
            return (action === NAME_DIALOG_ACTION_NEW || index !== currentIndex) && (simulation.name.toLowerCase() === trimmedName.toLowerCase())
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
        <React.Fragment>
        <SimulationSplitButton
            simulations={simulations}
            currentIndex={currentIndex}
            onSelectionChange={onSelectionChange}
        />
        <Paper
            sx={{
                borderWidth: '1px',
                borderColor: theme => theme.palette.divider,
                borderStyle: 'solid',
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
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
                    tooltip={"Sauvegarder"}
                    onClick={handleSave}
                    disabled={isDirty(simulation) === false}
                    edge="start"
                >
                    <SaveOutlinedIcon />
                </TooltipIconButton>

                <TooltipIconButton
                    tooltip={'Renommer'}
                    onClick={onRenameCurrent}
                    edge="start"
                >
                    <DriveFileRenameOutlineIcon />
                </TooltipIconButton>

                <TooltipIconButton
                    tooltip={simulation.isLocked ? "Déverrouiller": "Verrouiller"}
                    onClick={handleToggleLock}
                    edge="start"
                >
                    {
                        simulation.isLocked ?
                        <LockOpenOutlinedIcon /> :
                        <LockOutlinedIcon />
                    }
                </TooltipIconButton>

                <TooltipIconButton
                    tooltip="Ajouter une simulation"
                    onClick={handleAdd}
                    edge="start"
                >
                    <AddOutlinedIcon />
                </TooltipIconButton>

                <Divider orientation="vertical" flexItem />

                <TooltipIconButton
                    tooltip={"Supprimer"}
                    onClick={() => setDeletionDlgOpen(true)}
                    disabled={simulations.length === 1 && isFromDb(simulations[0]) === false}
                    style={{
                        marginLeft: 10,
                        marginRight: -12
                    }}
                >
                    <DeleteOutlineOutlinedIcon />
                </TooltipIconButton>

            </Toolbar>

        </Paper>
    </React.Fragment>
)};

export default withLoading(
    withUser(SimulationToolBar, { alert: false /* No alert if not connected */ }),
    [buildLoadingState("currentIndex", -1)]);