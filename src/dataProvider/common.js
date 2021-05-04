export const TRANSIENT_PROPERTY_DB_INDEX = "dbindex";
export const TRANSIENT_PROPERTY_IS_DIRTY = "isDirty";

export const TransientProperties = [
    TRANSIENT_PROPERTY_DB_INDEX,
    TRANSIENT_PROPERTY_IS_DIRTY
];

// Delete transient properties we don't want to save in database
export function deleteTransientProperties(simulation, keepProperties) {
    TransientProperties.forEach(propName => {
        if (keepProperties === undefined || keepProperties.includes(propName) === false) {
            delete simulation[propName];
        }
    });
}

export function getDbIndex(simulation) {
    return simulation[TRANSIENT_PROPERTY_DB_INDEX];
}

export function setDbIndex(simulation, dbindex) {
    simulation[TRANSIENT_PROPERTY_DB_INDEX] = dbindex;
}

export function isFromDb(simulation) {
    return simulation[TRANSIENT_PROPERTY_DB_INDEX] !== undefined;
}

export function isDirty(simulation) {
    return simulation[TRANSIENT_PROPERTY_IS_DIRTY] === true;
}
