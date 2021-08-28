import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export const Loading = ({size, marginTop}) => {
    return (
        <CircularProgress
            sx={{
                mt: marginTop
            }}
            size={size}
        />
    )
}

const conditionIsReached = (condition, props) => {
    return props[condition.property] !== condition.value;
}

const isReady = (conditions, props) => {
    return conditions.every(condition => conditionIsReached(condition, props))
}

/**
 * 
 * @param {any} Component The Component to enhance with loading behavior
 * @param {array} conditions an array that contains the condition to consider the component ready to be displayed 
 * @returns An enhanced component that displays a Loading animation while it is not ready tp be displayed
 */
export const withLoading = (Component, conditions, loadingProps) => (props) => {

    const ready = React.useRef(false);

    if (ready.current === false) {
        ready.current = isReady(conditions, props);
    }

    return (
        ready.current === true ?
        <Component {...props} /> :
        <Loading {...loadingProps}/>
    );
}

export const buildLoadingState = (propertyName, value) => {
    return {
        property: propertyName,
        value: value
    }
}