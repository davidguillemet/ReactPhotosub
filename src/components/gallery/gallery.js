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

    const columnsCount = Math.floor((containerWidth - margin) / (colWidth + margin));
    // For each column, crrat an empty araray
    const columns = Array.from({length: columnsCount}, () => []);
    // and distribute images among columns

    images.forEach((image, index) => {
        columns[index % columnsCount].push(image);
    })

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