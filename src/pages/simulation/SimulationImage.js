import { useState } from 'react';
import { Rnd } from "react-rnd";
import { Box } from '@mui/system';
import CheckIcon from '@mui/icons-material/Check';
import { useEffect } from 'react';
import { styled } from '@mui/material/styles';

import { moveImage, resizeAndMoveImage } from './actions/SimulationActions';
import { getThumbnailSrc } from '../../utils';

const SelectionMarker = ({imageBorderWidth}) => {
    return (
        <Box
            sx={{
                position: "absolute",
                top: `${imageBorderWidth}px`,
                left: `${imageBorderWidth}px`,
                right: `${imageBorderWidth}px`,
                bottom: `${imageBorderWidth}px`,
                borderColor: theme => theme.palette.warning.light,
                borderWidth: "5px",
                borderStyle: "solid"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    position: "absolute",
                    right: "3px",
                    bottom: "3px",
                    backgroundColor: theme => theme.palette.warning.light,
                    borderRadius: '2px',
                }}
            >
                <CheckIcon
                    fontSize="medium"
                    sx={{
                        color: "white"
                    }}
                />
            </Box>
        </Box>
    )
}

const StyledRnd = styled(Rnd)(({ theme }) => ({ }));


const SimulationImage = ({image, selected, border, shadowFactor, dispatch, onClick, simulationIndex, locked}) => {

    const [position, setPosition] = useState(image.position);
    const [width, setWidth] = useState(image.width);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        setPosition(image.position);
    }, [image.position]);

    useEffect(() => {
        setWidth(image.width);
    }, [image.width]);

    const onDragStart = (event) => {
        setDragging(true);
    }
    const onDragStop = (event, data) => {
        dispatch(moveImage(image.id, data.y, data.x, simulationIndex))
        if (dragging === false) {
            handleClick();
        } else {
            setDragging(false);
        }
    };

    const onResizeStop = (e, direction, ref, delta, position) => {
        // Depending on the resize direction, we could have to change the position as well
        dispatch(resizeAndMoveImage(image.id, ref.offsetWidth, position.y, position.x, simulationIndex));
    };

    const handleClick = () => {
        onClick(image.id);
    };

    return (
        <StyledRnd
            position={{
                x: position.left,
                y: position.top
            }}
            size={{
                width: width,
                height: 'auto'
            }}
            lockAspectRatio={true}
            sx={{
                display: 'flex',
                backgroundColor: border.color,
                padding: `${border.width}px`,
                boxShadow: theme => theme.shadows[shadowFactor]
            }}
            bounds="parent"
            onDrag={onDragStart}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            disableDragging={locked}
            enableResizing={!locked}
        >
            <img 
                draggable="false"
                alt=""
                src={getThumbnailSrc(image, width)}
                style={{
                    width: '100%',
                    display: 'block'
                }}
            />

            {
                selected && <SelectionMarker imageBorderWidth={border.width} />
            }
            
        </StyledRnd>
    );
}

export default SimulationImage;