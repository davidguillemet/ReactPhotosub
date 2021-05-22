import { makeStyles } from '@material-ui/core/styles'
import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import LazyImage from './image';
import ExpandedView from './expandedView';
import { useResizeObserver } from '../../components/hooks';

const useStyles = makeStyles({
    galleryContainer: {
        position: 'relative'
    }
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

const MasonryLayout = ({images, colWidth, margin, containerWidth, onImageClick}) => {
    
    const columnsCount = Math.floor((containerWidth + margin) / (colWidth + margin));
    const realColumnWidth = (containerWidth - (columnsCount-1)*margin) / columnsCount;

    const totalMargin = (columnsCount-1)*margin;
    const imageWidth = (containerWidth - totalMargin) / columnsCount;

    // Compute the cumulative height of each column
    const columnTopPosition = Array.from({length: columnsCount}, () => 0);
    
    return (
        <React.Fragment>
            {
                images.map((image, index) => {
                    const targetColumnIndex = getTargetColumnIndex(columnTopPosition);
                    const imageHeight = realColumnWidth / image.sizeRatio;
                    const imageTop = columnTopPosition[targetColumnIndex] + margin;
                    columnTopPosition[targetColumnIndex] = imageTop + imageHeight;
                    return (
                        <LazyImage
                            key={image.id}
                            image={image}
                            onClick={onImageClick}
                            top={imageTop}
                            left={targetColumnIndex*(realColumnWidth+margin)}
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
    const [expandedImage, setExpandedImage] = useState(null);

    const resizeObserver = useResizeObserver();

    function onImageClick(imageId) {
        setExpandedImage(imageId);
    }

    function onCloseModal() {
        setExpandedImage(null);
    }

    return (
        <React.Fragment>
            <Box className={classes.galleryContainer} ref={resizeObserver.ref} style={style}>
            {
                resizeObserver.width > 0 && 
                <MasonryLayout
                    images={images}
                    colWidth={colWidth}
                    margin={margin}
                    containerWidth={resizeObserver.width}
                    onImageClick={onImageClick}
                />
            }
            </Box>
            <Modal
                open={expandedImage !== null}
                onClose={onCloseModal}
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 1000,
                    style: {
                        backgroundColor: '#fff'
                    }
                }}
            >
                <Fade in={expandedImage !== null}>
                    { /* Empty wrapper node to avoid error "The modal content node does not accept focus" */ }
                    <>
                        <ExpandedView images={images} currentId={expandedImage} onClose={onCloseModal} />
                    </>
                </Fade>
            </Modal>
        </React.Fragment>
    );
}

export default Gallery;