import React, {useMemo} from 'react';
import Paper from '@material-ui/core/Paper';
import LockIcon from '@material-ui/icons/Lock';

import SimulationImage from './SimulationImage';

const SimulationDisplay = React.forwardRef(({simulations, simulationIndex, dispatch, seletedImage, onImageClick}, ref) => {

    const simulation = useMemo(() => simulations[simulationIndex], [simulations, simulationIndex]);

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
                                selected={seletedImage === image.id}
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
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10
                    }}
                />
            }
        </Paper>
    );
});

export default SimulationDisplay;