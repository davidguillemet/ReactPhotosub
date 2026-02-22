import React from 'react';
import TextField from '@mui/material/TextField';

const AutoFocusTextField = (props) => {

    const { autoFocus } = props;

    const focusInputField = input => {
        if (input && autoFocus) {
            setTimeout(() => {
                input.focus()
            }, 100);
        }
    };

    return (
        <TextField
            inputRef={focusInputField}
            {...props}
        />
    )
};

export default AutoFocusTextField;