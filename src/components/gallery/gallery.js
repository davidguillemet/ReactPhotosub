import { makeStyles } from '@material-ui/core/styles'
import React, { useState, useEffect, useRef} from 'react';
import Box from '@material-ui/core/Box';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import LazyImage from './image';
import ExpandedView from './expandedView';
import { Hidden } from '@material-ui/core';

const useStyles = makeStyles({
    galleryContainer: {
        position: 'relative'
    }
});

function debounce(fn, ms) {
    let timer
    return () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        fn.apply(this, arguments)
      }, ms)
    };
 }

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

const Gallery = ({ images, style, colWidth, margin }) => {
    const [containerWidth , setContainerWidth] = useState(0);
    const [expandedImage, setExpandedImage] = useState(null);
    const containerRef = useRef(null);
    const classes = useStyles();

    useEffect(() => {
        const debouncedHandleResize = debounce(function handleResize() {
            setContainerWidth(containerRef.current.clientWidth);
        }, 200);
        setContainerWidth(containerRef.current.clientWidth);
        window.addEventListener("resize", debouncedHandleResize);
        return () => window.removeEventListener("resize", debouncedHandleResize);
    }, []);

    function onImageClick(imageId) {
        setExpandedImage(imageId);
    }

    function onCloseModal() {
        setExpandedImage(null);
    }

    // Number of columns to display depending on the standard column width
    const columnsCount = Math.floor((containerWidth + margin) / (colWidth + margin));
    const realColumnWidth = (containerWidth - (columnsCount-1)*margin) / columnsCount;

    const pageContainerPadding = 10; // Page padding : TODO use a global value
    const totalMargin = 2*pageContainerPadding + (columnsCount-1)*margin;
    const imageWidthCalculation = `calc((100vw - ${totalMargin}px)/${columnsCount})`;

    // Compute the cumulative height of each column
    const columnTopPosition = Array.from({length: columnsCount}, () => 0);

    return (
        <React.Fragment>
            <Box className={classes.galleryContainer} ref={containerRef} style={style}>
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
                            width={imageWidthCalculation}
                        />
                    );
                })
            }
                <div style={{
                    zIndex: -1,
                    visibility: 'hidden',
                    height: Math.max(...columnTopPosition)
                }} />
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
                    <ExpandedView images={images} currentId={expandedImage} onClose={onCloseModal}></ExpandedView>
                </Fade>
            </Modal>
        </React.Fragment>
    );
}

export default Gallery;