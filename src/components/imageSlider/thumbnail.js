import { useMemo } from 'react';
import { Fab } from '@mui/material';
import Box from '@mui/material/Box';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
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
    onDelete,
    renderOverlay = null}) => {

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
                width: `${imageWidth+2*imageBorderWidth}px`,
                borderRadius: `${imageBorderRadius}px`
            }}>
                <LazyImage
                    image={image} 
                    index={index}
                    onClick={handleClick}
                    width={imageWidth}
                    withOverlay={false}
                    renderOverlay={renderOverlay}
                    withFavorite={false}
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
