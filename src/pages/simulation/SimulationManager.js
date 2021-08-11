import React, { useEffect, useState, useCallback, useMemo, useReducer } from 'react';

import { Prompt } from "react-router-dom";

import {unstable_batchedUpdates} from 'react-dom';

import PageTitle from '../../template/pageTitle';
import { VerticalSpacing } from '../../template/spacing';
import dataProvider, { isFromDb, isDirty, getDbIndex } from '../../dataProvider';
import SimulationToolBar from './SimulationToolBar';
import Simulation from './Simulation';

import FeedbackMessage from '../../components/feedback';
import { AuthContext } from '../../components/authentication';
import { uniqueID } from '../../utils/utils';

import simulationsReducer from './actions/SimulationReducer';
import {
    initSimulations,
    addSimulation,
    deleteSimulation,
    setSimulationDbIndex,
    setSimulationDirty
} from './actions/SimulationActions';

import 'fontsource-roboto/100.css';

const SimulationManager = ({ user }) => {

    /**
     * state = {
     *  simulations: <array>,
     *  currentIndex: <integer>
     * }
     */
    const [state, dispatch] = useReducer(simulationsReducer, null);
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

    // load simulations if connected
    // -> simulations won't be null after this hook execution
    useEffect(() => {
        if (user !== null) {
            dataProvider.getSimulations().then(res => {
                dispatch(initSimulations(res));
            })
        } else {
            dispatch(addSimulation());
        }
    }, [user]);

    const onSave = useCallback((simulationname) => {
        const simulationData = state.simulations[state.currentIndex];
        if (simulationname) {
            simulationData.name = simulationname;
        }
        
        if (isFromDb(simulationData)) {
            dataProvider.updateSimulation(simulationData).then(res => {
                unstable_batchedUpdates(() => {
                    dispatch(setSimulationDirty(false, state.currentIndex));
                    displayFeedback("success", `The simulation '${simulationData.name}' has been saved.`);
                });
            }).catch (err => {
                console.error(`error while saving the simulation '${simulationData.name}':`);
                console.error(err);
                displayFeedback("error", "Error while saving the simulation...");
            })
        } else {
            dataProvider.addSimulation(simulationData).then(res => {
                // res contains all the simulations
                // The last one is the new one
                const newSimulationFromDb = res[res.length-1];
                const dbIndex = getDbIndex(newSimulationFromDb);
                if (dbIndex !== res.length - 1) {
                    const message = `The dbindex of the new simulation should be ${res.length - 1}`;
                    console.error(message);
                    throw new Error(message);
                }
                unstable_batchedUpdates(() => {
                    dispatch(setSimulationDbIndex(dbIndex, state.currentIndex));
                    displayFeedback("success", `The simulation '${simulationData.name}' has been saved.`);
                });
            }).catch (err => {
                console.error(`error while saving the simulation '${simulationData.name}':`);
                console.error(err);
                displayFeedback("error", "Error while saving the simulation...");
            });
        } 
    }, [displayFeedback, state]);

    const onAdd = useCallback((name) => {
        unstable_batchedUpdates(() => {
            dispatch(addSimulation(name));
            displayFeedback("success", `The simulation '${name}' has been added.`);
        });
    }, [dispatch, displayFeedback]);

    const onDelete = useCallback(() => {

        const simulationToRemove = state.simulations[state.currentIndex];
        const simulationName = simulationToRemove.name;

        const removePromise =
            isFromDb(simulationToRemove) ?
            dataProvider.removeSimulation(simulationToRemove) :
            Promise.resolve(null); // just remove from the store

        removePromise.then((res) => {
            unstable_batchedUpdates(() => {
                dispatch(deleteSimulation(state.currentIndex, res));
                displayFeedback("success", `The simulation '${simulationToRemove.name}' has been removed.`);
            });
        }).catch (err => {
            console.error(`Error while deleting the simulation '${simulationName}'`);
            console.error(err);
            displayFeedback("error", `Error while deleting the simulation '${simulationName}'`);
        });

    }, [state, dispatch, displayFeedback]);

    const promptMessage = useMemo(() => {
        let message = "Des modifications sont en cours.\n"
                    + "Cliquez sur OK pour confirmer la navigation et perdre vos modifications.\n"
                    + "Cliquez sur Annuler pour rester sur la page et sauvagarder vos modifications";
        if (user === null) {
            message += " (connexion requise)";
        }
        return message;
    }, [user]);

    const hasDirty = state !== null && state.simulations.find(simulation => isDirty(simulation)) !== undefined;
    return (
        <React.Fragment>

            <Prompt when={hasDirty} message={promptMessage} />

            <FeedbackMessage severity={feedback.severity} message={feedback.message} key={feedback.key}/>

            <PageTitle>Simulation</PageTitle>

            {
                user && state &&
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

            {
                state &&
                <Simulation simulations={state.simulations} simulationIndex={state.currentIndex} user={user} dispatch={dispatch} />
            }

        </React.Fragment>
    );
};

const SimulationManagerConsumer = (props) => {
    return (
        <AuthContext.Consumer>
            { ({user, data, updateUserContext}) => {
                return (
                    <SimulationManager
                        user={user}
                        updateUserContext={updateUserContext}
                        {...props}
                    />
                );
            }}
        </AuthContext.Consumer>
    );
}

export default SimulationManagerConsumer;