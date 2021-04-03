import { makeStyles } from '@material-ui/core/styles'
import React, { useState, useEffect, useRef} from 'react';
import Box from '@material-ui/core/Box';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import LazyImage from './image';
import ExpandedView from './expandedView';

const useStyles = makeStyles({
    galleryContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
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

function dispatchImages(images, containerWidth, colWidth, margin) {
    
    // Number of columns to display depending on the standard column width
    const columnsCount = Math.floor((containerWidth - margin) / (colWidth + margin));
    const realColumnWidth = (containerWidth - margin - columnsCount*margin) / columnsCount;
    
    // For each column, create an empty araray
    const columns = Array.from({length: columnsCount}, () => []);

    // Compute the cumulative height of each column
    const columnHeight = Array.from({length: columnsCount}, () => 0);
    
    // and distribute images among columns
    images.forEach((image, index) => {
        image.displayHeight = realColumnWidth / image.sizeRatio;
        // Take the first column where the total height is the lowest
        const targetIndex = getTargetColumnIndex(columnHeight);
        columns[targetIndex].push(image);
        columnHeight[targetIndex] += image.displayHeight
    })

    return columns;
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

    const columns = dispatchImages(images, containerWidth, colWidth, margin);

    return (
        <React.Fragment>
            <Box className={classes.galleryContainer} ref={containerRef} style={style}>
            {columns.map((column, index) => {
                return (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            alignContent: "stretch",
                            flex: 1,
                            width: 0,
                            marginLeft: index > 0 ? margin : undefined,
                    }}>
                        {column.map((image, index) => {
                            return (
                                <LazyImage
                                    key={image.id}
                                    image={image}
                                    margin={index > 0 ? margin : undefined}
                                    onClick={onImageClick}
                                />
                            );
                        })}
                    </div>
                );
            })}
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