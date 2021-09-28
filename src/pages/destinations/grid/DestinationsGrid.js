import React, { useMemo, useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { getThumbnailSrc } from '../../../utils';
import Destination from './Destination';
import { withLoading, buildLoadingState } from '../../../components/loading';
import { useResizeObserver } from '../../../components/hooks';
import './destinationTileStyles.css';

const _destinationsMargin = 7;
const _destinationsBaseWidth = 300;

const DestinationsGrid = ({destinations, regionsByDestination}) => {

    const resizeObserver = useResizeObserver();

    const [galleryProps, setGalleryProps] = useState({
        imageWidth: _destinationsBaseWidth,
        columnsCount: 0
    });

    const adaptedDestinations = useMemo(() => {
        return destinations.map(destination => {
            return {
                ...destination,
                // Maybe we should compute the size ans use resizeObserver instead of using hard-coded thumb size??
                cover: getThumbnailSrc(destination.cover, 500)
            }
        })

    }, [destinations]);

    useEffect(() => {
        const containerWidth = resizeObserver.width;
        const columnsCount = Math.floor((containerWidth + _destinationsMargin) / (_destinationsBaseWidth + _destinationsMargin));
        const totalMargin = (columnsCount-1)*_destinationsMargin;
        let imageWidth = Math.round((containerWidth - totalMargin) / columnsCount);
        if (imageWidth * columnsCount + _destinationsMargin * (columnsCount-1) > containerWidth) {
            imageWidth--;
        }
        setGalleryProps({
            imageWidth: imageWidth,
            columnsCount: columnsCount
        });
    }, [resizeObserver.width])

    return (
        <Box
            ref={resizeObserver.ref}
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                m: 0,
                width: '100%'
            }}
        >
            <TransitionGroup component={null}>
            {
                adaptedDestinations.map((item, index) => {
                    return (
                        <CSSTransition
                        key={item.id}
                        timeout={500}
                        classNames="destinationTile"
                        >                
                        <Destination
                            key={item.id}
                            destination={item}
                            regions={regionsByDestination.get(item.id)}
                            itemWidth={galleryProps.imageWidth}
                            margin={_destinationsMargin}
                            colIndex={index % galleryProps.columnsCount}
                        />
                        </CSSTransition>
                    );
                })
            }
            </TransitionGroup>
        </Box>
    );
}

export default withLoading(DestinationsGrid, [
    buildLoadingState("destinations", [null, undefined]),
    buildLoadingState("regionsByDestination", null)
]);