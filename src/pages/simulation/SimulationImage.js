import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Rnd } from "react-rnd";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { green, grey } from '@material-ui/core/colors';
import { useEffect } from 'react';

import {moveImage, resizeAndMoveImage, deleteImage} from './actions/SimulationActions';

const useStyle = makeStyles((theme) => ({
    container: {
        '&:hover [class*="buttonGroup"]': {
            display: 'block'
        }
    },
    selectdCheck: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[600],
        },
    },
    notSelectdCheck: {
        backgroundColor: grey[500],
        '&:hover': {
            backgroundColor: grey[600],
        },
    },
    buttonGroup: {
        display: 'none',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
    },
    visibleButtonGroup: {
        display: 'block'
    }
}));


const SimulationImage = ({image, selected, border, dispatch, onClick, simulationIndex, locked}) => {

    const classes = useStyle();

    const [position, setPosition] = useState(image.position);
    const [width, setWidth] = useState(image.width);

    useEffect(() => {
        setPosition(image.position);
    }, [image.position]);

    useEffect(() => {
        setWidth(image.width);
    }, [image.width]);

    const onDragStop = (event, data) => {
        dispatch(moveImage(image.id, data.y, data.x, simulationIndex))
    };

    const onResizeStop = (e, direction, ref, delta, position) => {
        // Depending on the resize direction, we could have to change the position as well
        dispatch(resizeAndMoveImage(image.id, ref.offsetWidth, position.y, position.x, simulationIndex));
    };

    const onDelete = () => {
        dispatch(deleteImage(image.id, simulationIndex));
    };

    const handleClick = () => {
        onClick(image.id);
    };

    return (
        <Rnd
            position={{
                x: position.left,
                y: position.top
            }}
            size={{
                width: width,
                height: 'auto'
            }}
            lockAspectRatio={true}
            style={{
                display: 'flex',
                backgroundColor: border.color,
                padding: border.width,
                boxShadow: 'rgb(153 153 153) 5px 5px 5px'
            }}
            bounds="parent"
            className={classes.container}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            disableDragging={locked}
            enableResizing={!locked}
        >
            <img 
                draggable="false"
                alt=""
                src={image.src}
                style={{
                    width: '100%',
                    display: 'block'
                }}
            />
            
            <ButtonGroup
                variant="contained"
                color="secondary"
                aria-label="outlined primary button group"
                className={clsx(classes.buttonGroup, selected && classes.visibleButtonGroup)}
                disabled={locked}
            >
                <Button
                    className={selected ? classes.selectdCheck : classes.notSelectdCheck}
                    onClick={handleClick}
                    startIcon={<EditIcon />}>
                </Button>
                <Button
                    onClick={onDelete}
                    startIcon={<DeleteOutlineIcon />}>
                </Button>
            </ButtonGroup>
        </Rnd>
    );
}

export default SimulationImage;