import React, { useEffect, useState, useCallback, useMemo, useReducer, useRef } from 'react';

import { Prompt } from "react-router-dom";

import {unstable_batchedUpdates} from 'react-dom';

import { PageTitle } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { isFromDb, isDirty, getDbIndex } from '../../dataProvider';
import SimulationToolBar from './SimulationToolBar';
import Simulation from './Simulation';

import FeedbackMessage from '../../components/feedback';
import { useAuthContext } from '../../components/authentication';
import { uniqueID } from '../../utils';
import { useGlobalContext } from '../../components/globalContext';

import simulationsReducer from './actions/SimulationReducer';
import {
    initSimulations,
    addSimulation,
    deleteSimulation,
    setSimulationDbIndex,
    setSimulationDirty
} from './actions/SimulationActions';

import 'fontsource-roboto/100.css';

const sameUsers = (user1, user2) => {
    if (user1 === null && user2 === null) {
        return true;
    }
    if (user1 === undefined && user2 === undefined) {
        return true;
    }
    if (user1 === null || user2 === null ||
        user1 === undefined || user2 === undefined) {
        return false;
    }
    return (user1.uid === user2.uid);
}

const initialState = {
    simulations: [],
    currentIndex: -1
};

const SimulationManager = () => {

    const context = useGlobalContext();
    const authContext = useAuthContext();
    const { data: fetchedSimulations } = context.useFetchSimulations(authContext.user && authContext.user.uid);
    const addMutation = context.useAddSimulation();
    const updateSimulation = context.useUpdateSimulation();
    const removeSimulation = context.useRemoveSimulation();
    const simulationInitUser = useRef(undefined);
    /**
     * state = {
     *  simulations: <array>,
     *  currentIndex: <integer>
     * }
     */
    const [state, dispatch] = useReducer(simulationsReducer, initialState);
    const [feedback, setFeedback] = useState({
        severity: "success",
        message: null,
        key: uniqueID()
    })

    const displayFeedback = useCallback((severity, message) => {
        setFeedback({
            severity: severity,
            message: message,
            key: uniqueID()
        });
    }, []);

    useEffect(() => {
        // No need to reinit simulations state it the user is the same
        // -> initialize only once on component mount
        if (fetchedSimulations !== undefined && sameUsers(simulationInitUser.current, authContext.user) === false) {
            simulationInitUser.current = authContext.user;
            dispatch(initSimulations(fetchedSimulations));
        }
    }, [fetchedSimulations, authContext.user]);

    const onSave = useCallback((simulationname) => {
        const simulationData = state.simulations[state.currentIndex];
        if (simulationname) {
            simulationData.name = simulationname;
        }
        
        if (isFromDb(simulationData)) {
            updateSimulation.mutateAsync(simulationData).then(res => {
                unstable_batchedUpdates(() => {
                    dispatch(setSimulationDirty(false, state.currentIndex));
                    displayFeedback("success", `la composition '${simulationData.name}' a été sauvegardée.`);
                });
            }).catch (err => {
                console.error(`error while saving the composition '${simulationData.name}':`);
                console.error(err);
                displayFeedback("error", `Une erreur est survenue lors de la sauvegarde de la composition '${simulationData.name}'`);
            })
        } else {
            addMutation.mutateAsync(simulationData).then(res => {
                // res contains all the simulations
                // The last one is the new one
                const newSimulationFromDb = res[res.length-1];
                const dbIndex = getDbIndex(newSimulationFromDb);
                if (dbIndex !== res.length - 1) {
                    const message = `The dbindex of the new composition should be ${res.length - 1}`;
                    console.error(message);
                    throw new Error(message);
                }
                unstable_batchedUpdates(() => {
                    dispatch(setSimulationDbIndex(dbIndex, state.currentIndex));
                    displayFeedback("success", `La composition '${simulationData.name}' a été sauvegardée.`);
                });
            }).catch (err => {
                console.error(`error while saving the coposition '${simulationData.name}':`);
                console.error(err);
                displayFeedback("error", `Une erreur est survenue lors de la sauvegarde de la composition '${simulationData.name}'`);
            });
        } 
    }, [displayFeedback, state, addMutation, updateSimulation]);

    const onAdd = useCallback((name) => {
        unstable_batchedUpdates(() => {
            dispatch(addSimulation(name));
            displayFeedback("success", `La composition '${name}' a été ajoutée.`);
        });
    }, [dispatch, displayFeedback]);

    const onDelete = useCallback(() => {

        const simulationToRemove = state.simulations[state.currentIndex];
        const simulationName = simulationToRemove.name;

        const removePromise =
            isFromDb(simulationToRemove) ?
            removeSimulation.mutateAsync(simulationToRemove) :
            Promise.resolve(null); // just remove from the store

        removePromise.then((res) => {
            unstable_batchedUpdates(() => {
                dispatch(deleteSimulation(state.currentIndex, res));
                displayFeedback("success", `La composition '${simulationToRemove.name}' a été supprimée.`);
            });
        }).catch (err => {
            console.error(`Error while deleting the composition '${simulationName}'`);
            console.error(err);
            displayFeedback("error", `Une erreur est survenue lors de la suppression de la composition '${simulationName}'`);
        });

    }, [state, dispatch, displayFeedback, removeSimulation]);

    const promptMessage = useMemo(() => {
        let message = "Des modifications sont en cours.\n"
                    + "Cliquez sur OK pour confirmer la navigation et perdre vos modifications.\n"
                    + "Cliquez sur Annuler pour rester sur la page et sauvagarder vos modifications";
        if (authContext.user === null) {
            message += " (connexion requise)";
        }
        return message;
    }, [authContext.user]);

    const hasDirty = state !== null && state.simulations.find(simulation => isDirty(simulation)) !== undefined;

    // Add a simulation property to the simulation to recreate the component from scratch when the user changes
    // -> avoid an issue when refreshing the page
    const simulationKey = authContext.user !== null ? authContext.user.uid : "anonymous";

    return (
        <React.Fragment>

            <Prompt when={hasDirty} message={promptMessage} />

            <FeedbackMessage severity={feedback.severity} message={feedback.message} key={feedback.key}/>

            <PageTitle>Composition</PageTitle>

            {
                authContext.user && state &&
                <SimulationToolBar
                    simulations={state.simulations}
                    currentIndex={state.currentIndex}
                    onSave={onSave}
                    onAdd={onAdd}
                    onDelete={onDelete}
                    dispatch={dispatch}
                />
            }

            <VerticalSpacing factor={3} />

            <Simulation
                simulations={state.simulations}
                simulationIndex={state.currentIndex}
                user={authContext.user}
                dispatch={dispatch}
                key={simulationKey}
            />

        </React.Fragment>
    );
};

export default SimulationManager;