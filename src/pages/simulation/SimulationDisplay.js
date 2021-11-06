import React, {useCallback, useMemo} from 'react';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/system';
import Fab from '@mui/material/Fab';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteImage} from './actions/SimulationActions';


import SimulationImage from './SimulationImage';

const ImageTools = ({onDelete}) => {

    return (
        <Box sx={{
            '& > :not(style)': { m: 1 },
            position: "absolute",
            top: 1,
            right: 1
        }}>
            <Fab sx={{color: "white", backgroundColor: theme => theme.palette.warning.light}} aria-label="edit" size="small" onClick={onDelete}>
                <DeleteIcon />
            </Fab>
        </Box>
    );
}

const SimulationDisplay = React.forwardRef(({simulations, simulationIndex, dispatch, selectedImage, onToggleCurrentImageId}, ref) => {

    const simulation = useMemo(() => simulations[simulationIndex], [simulations, simulationIndex]);

    const onDeleteSelectedImage = useCallback(() => {
        onToggleCurrentImageId(selectedImage);
        dispatch(deleteImage(selectedImage, simulationIndex));
    }, [selectedImage, simulationIndex, dispatch, onToggleCurrentImageId]);

    const onImageClick = useCallback((id) => {
        onToggleCurrentImageId(id);
    }, [onToggleCurrentImageId])

    return (
        <Paper
            ref={ref}
            style={{
                width: '100%',
                maxWidth: 1200,
                position: 'relative'
            }}
        >
            <img
                alt=""
                border="0"
                src={simulation.background}
                style={{
                    width: '100%',
                    display: 'block'
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
            >
            {
                simulation.images.map((image, index) => {
                    return <SimulationImage
                                key={image.id}
                                image={image}
                                border={simulation.border}
                                dispatch={dispatch}
                                selected={selectedImage === image.id && simulation.isLocked === false}
                                onClick={onImageClick}
                                simulationIndex={simulationIndex}
                                locked={simulation.isLocked}
                            />
                })
            }
            </div>

            { 
                simulation.isLocked &&
                <LockIcon
                    fontSize='large'
                    sx={{
                        position: "absolute",
                        top: 1,
                        left: 1,
                        color: theme => theme.palette.warning.light
                    }}
                />
            }

            {
                selectedImage !== null && simulation.isLocked === false &&
                <ImageTools onDelete={onDeleteSelectedImage} />
            }
        </Paper>
    );
});

export default SimulationDisplay;