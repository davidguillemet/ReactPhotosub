import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorAlert from '../error';
import { QUERY_ERROR } from '../reactQuery';

export const Loading = ({size, sx = { }}) => {
    return (
        <CircularProgress
            sx={{
                ...sx
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

const isError = (conditions, props) => {
    return conditions.find(condition => props[condition.property] === QUERY_ERROR)
}

/**
 * 
 * @param {any} Component The Component to enhance with loading behavior
 * @param {array} conditions an array that contains the condition to consider the component ready to be displayed 
 * @returns An enhanced component that displays a Loading animation while it is not ready tp be displayed
 */
export const withLoading = (Component, conditions, loadingProps) => (props) => {

    if (isError(conditions, props)) {
        return (
            <ErrorAlert />
        )
    }

    // Don't keep a ref since the state might change when props change
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