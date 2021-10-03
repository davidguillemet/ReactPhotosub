import { useMemo } from 'react';
import { Fab } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import LazyImage from '../lazyImage';

const Thumbnail = ({
    image,
    index,
    handleClick,
    active,
    imageHeight,
    imageBorderWidth = 3,
    imageBorderColor = "#000",
    imageBorderRadius = 3,
    disabled,
    onDelete}) => {

    const imageWidth = useMemo(() => Math.round(imageHeight * image.sizeRatio), [image, imageHeight])

    function handleDelete() {
        onDelete(image.src);
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
            <Box sx={{
                position: 'relative',
                padding: `${imageBorderWidth}px`,
                backgroundColor: active === true ? imageBorderColor : null,
                height: `${imageHeight + 2*imageBorderWidth}px`,
                borderRadius: `${imageBorderRadius}px`
            }}>
                <LazyImage
                    image={image} 
                    index={index}
                    onClick={handleClick}
                    width={imageWidth}
                    withOverlay={false}
                    withFavorite={false}
                    hoverEffect={false}
                    disabled={disabled}
                />
                {
                    image.uploaded &&
                    <Fab
                        size="small"
                        color="secondary"
                        disabled={image.deletable}
                        onClick={handleDelete}
                        style={{
                            position: 'absolute',
                            top: 5,
                            right: 5
                        }}
                    >
                        <DeleteOutlineOutlinedIcon />
                    </Fab>
                }
            </Box>
            {
                active === true &&
                <ArrowDropUpIcon
                    color="primary"
                    fontSize="large"
                    style={{
                        position: 'relative',
                        top: -10,
                        zIndex: 5
                    }}
                />
            }
        </Box>
    );
};

export default Thumbnail;
