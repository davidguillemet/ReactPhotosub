export const TRANSIENT_PROPERTY_DB_INDEX = "dbindex";
export const TRANSIENT_PROPERTY_IS_DIRTY = "isDirty";

export const TransientProperties = [
    TRANSIENT_PROPERTY_DB_INDEX,
    TRANSIENT_PROPERTY_IS_DIRTY
];

// Delete transient properties we don't want to save in database
export function deleteTransientProperties(simulation, keepProperties) {
    const propsToRollback = [];
    TransientProperties.forEach(propName => {
        if (keepProperties === undefined || keepProperties.includes(propName) === false) {
            if (simulation[propName]) {
                propsToRollback.push({
                    name: propName,
                    value: simulation[propName]
                })
                delete simulation[propName];
            }
        }
    });
    return () => {
        propsToRollback.forEach(prop => {
            simulation[prop.name] = prop.value;
        })
    }
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
