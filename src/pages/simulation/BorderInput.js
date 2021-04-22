import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import RemoveOutlinedIcon from '@material-ui/icons/RemoveOutlined';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';

const useInputStyle = makeStyles((theme) => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center'
      },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
}));

const BorderInput = ({value, onChange, width, disabled}) => {

    const [inputValue, setInputValue] = useState(value);
    const [isDisabled, setIsDisabled] = useState(disabled);
    const classes = useInputStyle();

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
        <Paper className={classes.root} style={{width: width}}>
        <IconButton className={classes.iconButton} onClick={decrementWidth} disabled={isDisabled}>
            <RemoveOutlinedIcon fontSize="large"/>
        </IconButton>
        <Divider className={classes.divider} orientation="vertical" />
        <InputBase
            className={classes.input}
            fullWidth
            value={inputValue}
            inputProps={{
                style: { textAlign: 'center' }
            }}
        />
        <Divider className={classes.divider} orientation="vertical" />
        <IconButton className={classes.iconButton} onClick={incrementWidth} disabled={isDisabled}>
            <AddOutlinedIcon fontSize="large" />
        </IconButton>
      </Paper>
    );
}

export default BorderInput;
