import { useEffect, useState } from 'react';
import { styled } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import RemoveOutlinedIcon from '@material-ui/icons/RemoveOutlined';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';

const StyledDivider = styled(Divider)(({theme}) => ({
    height: 28,
    margin: 4
}));

const StyledIconButton = styled(IconButton)(({theme}) =>({
    padding: theme.spacing(1)
}));

const BorderInput = ({value, onChange, width, disabled}) => {

    const [inputValue, setInputValue] = useState(value);
    const [isDisabled, setIsDisabled] = useState(disabled);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        setIsDisabled(disabled);
    }, [disabled]);

    function updateInputValue(value) {
        setInputValue(value);
        onChange(value)
    }
    
    function incrementWidth() {
        updateInputValue(inputValue + 1);
    }

    function decrementWidth() {
        if (inputValue > 0) {
            updateInputValue(inputValue - 1);
        }
    }

    return (
        <Paper sx={{
            display: 'flex',
            alignItems: 'center',  
            py: '2px',
            px: '4px',
            width: width
        }}>
        <StyledIconButton onClick={decrementWidth} disabled={isDisabled}>
            <RemoveOutlinedIcon />
        </StyledIconButton>
        <StyledDivider orientation="vertical" />
        <InputBase
            sx={{
                ml: 0.5,
                flex: 1,
            }}
            fullWidth
            value={inputValue}
            inputProps={{
                style: { textAlign: 'center' }
            }}
        />
        <StyledDivider orientation="vertical" />
        <StyledIconButton onClick={incrementWidth} disabled={isDisabled}>
            <AddOutlinedIcon />
        </StyledIconButton>
      </Paper>
    );
}

export default BorderInput;
