import React, { useEffect, useState, useCallback, useMemo, useReducer, useRef } from 'react';
import Button from '@mui/material/Button';
import HelpIcon from '@mui/icons-material/Help';
import { Prompt } from "react-router-dom";

import { PageTitle } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { isFromDb, isDirty, getDbIndex } from '../../dataProvider';
import SimulationToolBar from './SimulationToolBar';
import Simulation from './Simulation';
import { LazyDialog } from 'dialogs';

import { useAuthContext } from '../../components/authentication';
import { useQueryContext } from '../../components/queryContext';
import { useReactQuery } from '../../components/reactQuery';

import simulationsReducer from './actions/SimulationReducer';
import {
    initSimulations,
    addSimulation,
    deleteSimulation,
    setSimulationDbIndex,
    setSimulationDirty
} from './actions/SimulationActions';

import 'fontsource-roboto/100.css';
import { withLoading, buildLoadingState } from '../../components/hoc';
import { useToast } from '../../components/notifications';
import { useLanguage, useTranslation } from '../../utils';
import { useOverlay } from '../../components/loading';

const SimulationContext = React.createContext();

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

const SimulationManager = withLoading(({user, fetchedSimulations}) => {

    const queryContext = useQueryContext();

    const { state, dispatch } = React.useContext(SimulationContext);
    const { setOverlay: setActionIsRunning } = useOverlay();

    const addMutation = queryContext.useAddSimulation();
    const updateSimulation = queryContext.useUpdateSimulation();
    const removeSimulation = queryContext.useRemoveSimulation();
    const simulationInitUser = useRef(undefined);
    const { toast } = useToast();

    useEffect(() => {
        // No need to reinit simulations state if the user is the same
        // -> initialize only once on component mount
        if (fetchedSimulations !== null && sameUsers(simulationInitUser.current, user) === false) {
            const merge = (simulationInitUser.current === null || simulationInitUser.current === undefined) && user !== null && user !== undefined;
            simulationInitUser.current = user;
            dispatch(initSimulations(fetchedSimulations, merge));
        }
    }, [fetchedSimulations, user, dispatch]);

    const onSave = useCallback((simulationName) => {
        setActionIsRunning(true)

        const simulationData = state.simulations[state.currentIndex];
        if (simulationName) {
            simulationData.name = simulationName;
        }

        if (isFromDb(simulationData)) {
            updateSimulation.mutateAsync(simulationData).then(res => {
                dispatch(setSimulationDirty(false, state.currentIndex));
                toast.success(`la composition '${simulationData.name}' a été sauvegardée.`)
            }).catch (err => {
                // Empty
            }).finally(() => {
                setActionIsRunning(false);
            })
        } else {
            addMutation.mutateAsync(simulationData).then(res => {
                // res contains all the simulations
                // The last one is the new one
                const newSimulationFromDb = res[res.length-1];
                const dbIndex = getDbIndex(newSimulationFromDb);
                if (dbIndex !== res.length - 1) {
                    const message = `The dbindex of the new composition should be ${res.length - 1}`;
                    //console.error(message); // TRY TO REMOVE
                    throw new Error(message);
                }
                dispatch(setSimulationDbIndex(dbIndex, state.currentIndex));
                toast.success(`La composition '${simulationData.name}' a été sauvegardée.`);
            }).catch (err => {
                // Empty
            }).finally(() => {
                setActionIsRunning(false);
            })
        } 
    }, [setActionIsRunning, toast, state, addMutation, updateSimulation, dispatch]);

    const onAdd = useCallback((name) => {
        dispatch(addSimulation(name));
        toast.success(`La composition '${name}' a été ajoutée.`);
    }, [dispatch, toast]);

    const onDelete = useCallback(() => {

        setActionIsRunning(true);
        const simulationToRemove = state.simulations[state.currentIndex];

        const removePromise =
            isFromDb(simulationToRemove) ?
            removeSimulation.mutateAsync(simulationToRemove) :
            Promise.resolve(null); // just remove from the store

        removePromise.then((res) => {
            dispatch(deleteSimulation(state.currentIndex, res));
            toast.success(`La composition '${simulationToRemove.name}' a été supprimée.`);
        }).catch (err => {
            // Empty
        }).finally(() => {
            setActionIsRunning(false);
        })

    }, [setActionIsRunning, state, dispatch, toast, removeSimulation]);

    const promptMessage = useMemo(() => {
        let message = "Des modifications sont en cours.\n"
                    + "Cliquez sur OK pour confirmer la navigation et perdre vos modifications.\n"
                    + "Cliquez sur Annuler pour rester sur la page et sauvegarder vos modifications";
        if (user === null) {
            message += " (connexion requise)";
        }
        return message;
    }, [user]);

    const hasDirty = state !== null && state.simulations.find(simulation => isDirty(simulation)) !== undefined;

    // Add a simulation property to the simulation to recreate the component from scratch when the user changes
    // -> avoid an issue when refreshing the page
    const simulationKey = user !== null ? user.uid : "anonymous";

    return (
        <React.Fragment>

            <VerticalSpacing factor={2} />

            <SimulationToolBar
                simulations={state.simulations}
                currentIndex={state.currentIndex}
                onSave={onSave}
                onAdd={onAdd}
                onDelete={onDelete}
                dispatch={dispatch}
            />

            <VerticalSpacing factor={3} />

            <Simulation
                simulations={state.simulations}
                simulationIndex={state.currentIndex}
                user={user}
                dispatch={dispatch}
                key={simulationKey}
            />

            <Prompt when={hasDirty} message={promptMessage} />

        </React.Fragment>
    );
}, [buildLoadingState('fetchedSimulations', undefined)]);

const SimulationManagerConnected = ({user}) => {

    const queryContext = useQueryContext();
    const { data: fetchedSimulations } = useReactQuery(queryContext.useFetchSimulations, [user.uid]);
    return <SimulationManager user={user} fetchedSimulations={fetchedSimulations} />
}

const SimulationManagerDispatcher = withLoading(({user}) => {

    if (user === null) {
        return <SimulationManager user={null} fetchedSimulations={[]} />    
    } else {
        return <SimulationManagerConnected user={user} />
    }
}, [buildLoadingState('user', undefined)]);

const SimulationManagerController = () => {

    const { language } = useLanguage();
    const t = useTranslation("pages.composition");
    const authContext = useAuthContext();

    /**
     * state = {
     *  simulations: <array>,
     *  currentIndex: <integer>
     * }
     */
    const [state, dispatch] = useReducer(simulationsReducer, initialState);

    const [helpOpen, setHelpOpen] = useState(false);

    const toggleHelpOpen = useCallback(() => {
        setHelpOpen(open => !open);
    }, []);

     return (
        <React.Fragment>

            <PageTitle>Composition</PageTitle>

            <Button variant="contained" startIcon={<HelpIcon />} onClick={toggleHelpOpen}>{t("button::help")}</Button>

            <SimulationContext.Provider value={{ state, dispatch }}>
                <SimulationManagerDispatcher user={authContext.user} />
            </SimulationContext.Provider>

            <LazyDialog title={"Composition Murale"} path={`simulation/help.${language}`} open={helpOpen} handleClose={toggleHelpOpen} />

        </React.Fragment>
    )
}

export default SimulationManagerController;