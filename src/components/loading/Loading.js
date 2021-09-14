import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export const Loading = ({size, marginTop = 3}) => {
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
    if (Array.isArray(condition.value)) {
        return condition.value.every(value => props[condition.property] !== value);
    } else {
        return props[condition.property] !== condition.value;        
    }
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

    // Don't keep a ref since teh state might change when props change
    // -> the image slider for images in simulation when switching source
    const ready = isReady(conditions, props);

    return (
        ready === true ?
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