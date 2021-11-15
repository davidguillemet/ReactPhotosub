import { uniqueID } from '../../../utils';
import { TRANSIENT_PROPERTY_IS_DIRTY, TRANSIENT_PROPERTY_DB_INDEX, getDbIndex, isFromDb } from '../../../dataProvider';

import { clearThumbnailSrc } from '../../../utils';

// Actions for a single image
export const ACTION_UPDATE_IMAGE_SRC = 'image:set';
export const ACTION_MOVE_IMAGE = 'image:move';
export const ACTION_RESIZE_AND_MOVE_IMAGE = 'image:resizeAndMove';

// Actions for a single simulation
export const ACTION_RESIZE = 'simulation:resize';
export const ACTION_BACKGROUND = 'simulation:background';
export const ACTION_DELETE_IMAGE = 'simulation:deleteImage';
export const ACTION_ADD_IMAGE = 'simulation:addImage';
export const ACTION_BORDER_WIDTH = 'simulation:borderWidth';
export const ACTION_BORDER_COLOR = 'simulation:borderColor';
export const ACTION_SHADOW = 'simulation:shadow';
export const ACTION_SET_SIMULATION_DBINDEX = 'simulation:setDbIndex';
export const ACTION_SET_SIMULATION_DIRTY = 'simulation:setDirty';
export const ACTION_TOGGLE_LOCK = 'simulation:toggleLock';
export const ACTION_RENAME = 'simulation:rename';

// Actions on simulations' array
export const ACTION_LOAD_SIMULATIONS = 'simulations:load';
export const ACTION_SET_CURRENT_SIMULATION_INDEX = 'simulations:setCurrentIndex';
export const ACTION_ADD_SIMULATION = 'simulations:addSimulation';
export const ACTION_DELETE_SIMULATION = 'simulations:deleteSimulation';

const _fakeNamePrefix = "Sans nom";

function getNextFakeCount(simulations) {
    let fakeCount = 0;
    if (simulations) {
        const fakeNames = simulations.filter(simulation => simulation.name.startsWith(_fakeNamePrefix));
        fakeCount = fakeNames.length;
    }
    return `${_fakeNamePrefix} [${fakeCount+1}]`;
} 

function _initSimulation(name, simulations, containerWidth) {
    return {
        version: 5.0,
        id: uniqueID(),
        name: name ?? getNextFakeCount(simulations),
        containerWidth: containerWidth,
        background: null,
        isLocked: false,
        images: [],
        border: {
            color: "#FFFFFF",
            width: 0
        },
        shadow: 0,
        [TRANSIENT_PROPERTY_IS_DIRTY]: false
    };
}

function initImage(src, aspectRatio, containerWidth) {

    const imageLongestEdge = containerWidth / 3;
    const width =
        aspectRatio > 1 ?
        imageLongestEdge :
        imageLongestEdge * aspectRatio;
    const image = {
        width: width,
        position: {
            top: 0,
            left: (containerWidth - width) / 2
        },
        src: src,
        id: uniqueID()
    }

    return image;
}

function scaleImage(image, scale) {
    return {
        ...image,
        width: image.width * scale,
        position: {
            top: image.position.top * scale,
            left: image.position.left * scale
        }
    }
}

function scaleSimulation(simulation, currentContainerWidth) {
    const scale = simulation.containerWidth !== undefined ?
        currentContainerWidth / simulation.containerWidth : 1;
    const scaled = {
        ...simulation,
        containerWidth: currentContainerWidth,
        border: {
            ...simulation.border,
            width: Math.round(simulation.border.width * scale)
        },
        images: simulation.images.map(image => scaleImage(image, scale))
    }
    return scaled;
}

function imageReducer(state, action) {
    switch (action.type) {
        case ACTION_UPDATE_IMAGE_SRC:
            return {
                ...clearThumbnailSrc(state),
                src: action.src
            };
        case ACTION_MOVE_IMAGE:
            if (action.position.top === state.position.top &&
                action.position.left === state.position.left) {
                // No change: it might happen when we just click on the image
                return state;
            }
            return {
                ...state,
                position: action.position
            };
        case ACTION_RESIZE_AND_MOVE_IMAGE:
            return {
                ...state,
                width: action.width,
                position: action.position
            };
        default:
            return state;
    }
}

function simulationReducer(state, action) {
    switch (action.type) {
        case ACTION_RESIZE:
            return scaleSimulation(state, action.containerWidth);
        case ACTION_BACKGROUND:
            return {
                ...state,
                background: action.background,
                [TRANSIENT_PROPERTY_IS_DIRTY]: state.background !== null // isDirty is false for a new item for which we just initialize the background
            };
        case ACTION_DELETE_IMAGE:
            return {
                ...state,
                images: state.images.filter((image) => image.id !== action.imageId),
                [TRANSIENT_PROPERTY_IS_DIRTY]: true
            }
        case ACTION_ADD_IMAGE:
            return {
                ...state,
                images: [ ...state.images, initImage(action.src, action.aspectRatio, action.containerWidth) ],
                [TRANSIENT_PROPERTY_IS_DIRTY]: true
            }
        case ACTION_BORDER_WIDTH:
            return {
                ...state,
                border : {
                    width: action.width,
                    color: state.border.color
                },
                [TRANSIENT_PROPERTY_IS_DIRTY]: true
            }
        case ACTION_BORDER_COLOR:
            return {
                ...state,
                border : {
                    width: state.border.width,
                    color: action.color
                },
                [TRANSIENT_PROPERTY_IS_DIRTY]: true
            }
        case ACTION_SHADOW:
            return {
                ...state,
                shadow: action.shadow,
                [TRANSIENT_PROPERTY_IS_DIRTY]: true
            }
        case ACTION_SET_SIMULATION_DBINDEX:
            return {
                ...state,
                [TRANSIENT_PROPERTY_DB_INDEX]: action.dbindex,
                [TRANSIENT_PROPERTY_IS_DIRTY]: false // The simulation has just been saved
            }
        case ACTION_SET_SIMULATION_DIRTY:
            return {
                ...state,
                [TRANSIENT_PROPERTY_IS_DIRTY]: action.dirty
            }
        case ACTION_TOGGLE_LOCK:
            return {
                ...state,
                isLocked: !state.isLocked,
                [TRANSIENT_PROPERTY_IS_DIRTY]: true
            }
        case ACTION_RENAME:
            return {
                ...state,
                name: action.name,
                [TRANSIENT_PROPERTY_IS_DIRTY]: true
            }
        default:
            if (action.imageId !== undefined) {
                // An image identifier is specified
                const oldImageIndex = state.images.findIndex(image => image.id === action.imageId);
                const oldImage = state.images[oldImageIndex];
                const newImage = imageReducer(oldImage, action);
                if (newImage !== oldImage) {
                    // Remove the old image and replace by the new one
                    state.images.splice(oldImageIndex, 1, newImage);
                    return {
                        ...state,
                        images: [ ...state.images ],
                        [TRANSIENT_PROPERTY_IS_DIRTY]: true
                    }
                }
            }
            return state;
    }
}

export default function simulationsReducer(state, action) {
    switch (action.type) {
        case ACTION_LOAD_SIMULATIONS:
            const simulations =
                action.simulations.length > 0 ?
                action.simulations :
                [_initSimulation(null, null)];

            return {
                simulations: simulations,
                currentIndex: 0
            }
        case ACTION_SET_CURRENT_SIMULATION_INDEX:
            return {
                simulations: state.simulations,
                currentIndex: action.index
            }
        case ACTION_ADD_SIMULATION:
            const newSimulation = _initSimulation(action.name, state?.simulations);
            if (state === null) {
                return {
                    simulations: [newSimulation],
                    currentIndex: 0
                }
            }
            return {
                simulations: [ ...state.simulations, newSimulation],
                currentIndex: state.simulations.length // point to the new simulation
            }
        case ACTION_DELETE_SIMULATION:
            const newLength = state.simulations.length - 1;
            let newIndex = state.currentIndex;
            if (newIndex > newLength - 1) {
                newIndex--;
            }
            // Splice modifies the array state.simulations..then we just need to spread it in the new state
            state.simulations.splice(action.simulationIndex, 1);

            let newSimulations;
            if (action.currentSimulations !== null) {
                // This means we deleted a simulation from the database
                // In that case, we have to update the dbindex for all remaining simulations
                // 1. Build a map from simulation if to dbindex:
                const dbindexMap = new Map();
                action.currentSimulations.forEach(simulationDb => dbindexMap.set(simulationDb.id, getDbIndex(simulationDb)));
                // 2. Modify each
                newSimulations = state.simulations.map(simulation => {
                    return isFromDb(simulation) ?
                    { ...simulation, [TRANSIENT_PROPERTY_DB_INDEX]: dbindexMap.get(simulation.id) } : // update the dbindex
                    simulation; // returns the simulation untouched; it has not been saved in db
                });
            } else {
                newSimulations = [ ...state.simulations ];
            }

            if (newSimulations.length === 0) {
                newSimulations.push(_initSimulation(null, null));
                newIndex = 0;
            }

            return {
                simulations: newSimulations,
                currentIndex: newIndex
            }
        default:
            if (action.simulationIndex !== undefined) {
                // Action for a given simulation
                const oldSimulation = state.simulations[action.simulationIndex];
                const newSimulation = simulationReducer(oldSimulation, action);
                if (newSimulation !== oldSimulation) {
                    // the simulation reducer modified the simulation
                    // -> return a new simulations' array with the new one
                    const newSimulations = state.simulations.map((simulation, index) => {
                        return index === action.simulationIndex ? newSimulation : simulation;
                    })
                    return {
                        simulations: newSimulations,
                        currentIndex: state.currentIndex
                    }
                }
            }
            return state;
    }
}

export function simulationHasName(simulation) {
    // TODO : do something better...
    return simulation.name.startsWith(_fakeNamePrefix) === false;
}

