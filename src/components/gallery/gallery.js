import { makeStyles } from '@material-ui/styles'
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Zoom from '@material-ui/core/Zoom';
import Dialog from '@material-ui/core/Dialog';
import LazyImage from './image';
import ExpandedView from './expandedView';
import { useResizeObserver } from '../../components/hooks';
import {unstable_batchedUpdates} from 'react-dom';

const useStyles = makeStyles({
    galleryContainer: {
        position: 'relative'
    }
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Zoom ref={ref} {...props} />;
});

function getTargetColumnIndex(columnHeight) {

    let minHeight = Number.MAX_VALUE;
    let bestColumnIndex = 0;
    columnHeight.forEach((height, index) => {
        if (columnHeight[index] < minHeight) {
            minHeight = columnHeight[index];
            bestColumnIndex = index;
        }
    });
    return bestColumnIndex;
}

const MasonryLayout = ({images = [], imageWidth, columnsCount, margin, onImageClick}) => {
    
    // Compute the cumulative height of each column
    const columnTopPosition = Array.from({length: columnsCount}, () => 0);
    
    return (
        <React.Fragment>
            {
                images.map((image, index) => {
                    const targetColumnIndex = getTargetColumnIndex(columnTopPosition);
                    const imageHeight = imageWidth / image.sizeRatio;
                    const imageTop = columnTopPosition[targetColumnIndex] + margin;
                    columnTopPosition[targetColumnIndex] = imageTop + imageHeight;
                    return (
                        <LazyImage
                            key={image.id}
                            index={index}
                            image={image}
                            onClick={onImageClick}
                            top={imageTop}
                            left={targetColumnIndex*(imageWidth+margin)}
                            width={imageWidth}
                        />
                    );
                })
            }
            <div style={{
                zIndex: -1,
                visibility: 'hidden',
                height: Math.max(...columnTopPosition)
            }} />
        </React.Fragment>
    );
}

const Gallery = ({ images, style, colWidth, margin }) => {
    const classes = useStyles();
    const [expandedImageIndex, setExpandedImageIndex] = useState(null);
    const [expandedViewOpen, setExpandedViewOpen] = useState(false);
    const [masonryProps, setMasonryProps] = useState({
        imageWidth: colWidth,
        columnsCount: 0
    });

    const resizeObserver = useResizeObserver();

    function onImageClick(imageIndex) {
        unstable_batchedUpdates(() => {
            setExpandedImageIndex(imageIndex);
            setExpandedViewOpen(true);
        });
    }

    function onCloseModal(/*event, reason*/) {
        setExpandedViewOpen(false);
    }

    useEffect(() => {
        const containerWidth = resizeObserver.width;
        const columnsCount = Math.floor((containerWidth + margin) / (colWidth + margin));
        const totalMargin = (columnsCount-1)*margin;
        const imageWidth = Math.round((containerWidth - totalMargin) / columnsCount);
        setMasonryProps({
            imageWidth,
            columnsCount
        });
    }, [resizeObserver.width, colWidth, margin])

    return (
        <React.Fragment>
            <Box className={classes.galleryContainer} ref={resizeObserver.ref} style={style}>
            {
                masonryProps.columnsCount > 0 && 
                <MasonryLayout
                    images={images}
                    imageWidth={masonryProps.imageWidth}
                    columnsCount={masonryProps.columnsCount}
                    margin={margin}
                    onImageClick={onImageClick}
                />
            }
            </Box>
            <Dialog
                open={expandedViewOpen}
                onClose={onCloseModal}
                fullScreen={true}
                TransitionComponent={Transition}
            >
                <ExpandedView images={images} index={expandedImageIndex} onClose={onCloseModal} />
            </Dialog>
        </React.Fragment>
    );
}

export default Gallery;