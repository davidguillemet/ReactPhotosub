import {
    // Actions for a single image
    ACTION_UPDATE_IMAGE_SRC,
    ACTION_MOVE_IMAGE,
    ACTION_RESIZE_AND_MOVE_IMAGE,
    // Actions for a single simulation
    ACTION_RESIZE,
    ACTION_BACKGROUND,
    ACTION_DELETE_IMAGE,
    ACTION_ADD_IMAGE,
    ACTION_BORDER_WIDTH,
    ACTION_BORDER_COLOR,
    ACTION_SET_SIMULATION_DBINDEX,
    ACTION_SET_SIMULATION_DIRTY,
    ACTION_TOGGLE_LOCK,
    // Actions on simulations' array
    ACTION_LOAD_SIMULATIONS,
    ACTION_SET_CURRENT_SIMULATION_INDEX,
    ACTION_ADD_SIMULATION,
    ACTION_DELETE_SIMULATION
} from "./SimulationReducer";

//////////////////////////////////////////
// Action for the main simulations' array
//////////////////////////////////////////

export function initSimulations(simulations) {
    return {
        type: ACTION_LOAD_SIMULATIONS,
        simulations: simulations
    };
}

export function setCurrentSimulationIndex(index) {
    return {
        type: ACTION_SET_CURRENT_SIMULATION_INDEX,
        index: index
    };
}

export function addSimulation(name) {
    return {
        type: ACTION_ADD_SIMULATION,
        name: name
    };
}

export function deleteSimulation(index, currentSimulations) {
    return {
        type: ACTION_DELETE_SIMULATION,
        simulationIndex: index,
        currentSimulations: currentSimulations
    };
}

//////////////////////////////////////////
// Action for a specific simulation
//////////////////////////////////////////
export function setBackground(background, replace, simulationIndex) {
    return {
        type: ACTION_BACKGROUND,
        background: background,
        replace: replace,
        simulationIndex: simulationIndex
    };
}

export function resize(containerWidth, simulationIndex) {
    return {
        type: ACTION_RESIZE,
        containerWidth: containerWidth,
        simulationIndex: simulationIndex
    };
}

export function borderWidth(borderWidth, simulationIndex) {
    return {
        type: ACTION_BORDER_WIDTH,
        width: borderWidth,
        simulationIndex: simulationIndex
    };
}

export function borderColor(borderColor, simulationIndex) {
    return {
        type: ACTION_BORDER_COLOR,
        color: borderColor,
        simulationIndex: simulationIndex
    };
}

export function addImage(imageSrc, containerWidth, simulationIndex) {
    return {
        type: ACTION_ADD_IMAGE,
        src: imageSrc,
        containerWidth: containerWidth,
        simulationIndex: simulationIndex
    };
}

export function setImage(imageSrc, currentImageId, simulationIndex) {
    return {
        type: ACTION_UPDATE_IMAGE_SRC,
        src: imageSrc,
        imageId: currentImageId,
        simulationIndex: simulationIndex
    };
}

export function moveImage(imageId, top, left, simulationIndex) {
    return {
        type: ACTION_MOVE_IMAGE,
        imageId: imageId,
        position: {
            top: top,
            left: left
        },
        simulationIndex: simulationIndex
    };
}

export function resizeAndMoveImage(imageId, width, top, left, simulationIndex) {
    return {
        type: ACTION_RESIZE_AND_MOVE_IMAGE,
        imageId: imageId,
        position: {
            top: top,
            left: left
        },
        width: width,
        simulationIndex: simulationIndex
    };
}

export function deleteImage(imageId, simulationIndex) {
    return {
        type: ACTION_DELETE_IMAGE,
        imageId: imageId,
        simulationIndex: simulationIndex
    };
}

export function setSimulationDbIndex(dbindex, simulationIndex) {
    return {
        type: ACTION_SET_SIMULATION_DBINDEX,
        simulationIndex: simulationIndex,
        dbindex: dbindex
    };
}

export function setSimulationDirty(dirty, simulationIndex) {
    return {
        type: ACTION_SET_SIMULATION_DIRTY,
        simulationIndex: simulationIndex,
        dirty: dirty
    };
}

export function toggleLock(simulationIndex) {
    return {
        type: ACTION_TOGGLE_LOCK,
        simulationIndex: simulationIndex
    };
}
