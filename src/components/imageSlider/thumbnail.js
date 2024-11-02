import React from 'react';
import { useMemo } from 'react';
import { Fab } from '@mui/material';
import Box from '@mui/material/Box';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LazyImage from '../lazyImage';
import SelectionMarker from '../selectionMarker';

const Thumbnail = React.forwardRef(({
    image,
    index,
    handleClick,
    selected,
    imageHeight,
    spacing,
    disabled,
    onDelete,
    renderOverlay = null}, ref) => {

    const imageWidth = useMemo(() => Math.round(imageHeight * image.sizeRatio), [image, imageHeight])

    function handleDelete() {
        onDelete(image.src);
    }

    return (
        <Box
            ref={ref}
            sx={{
                position: 'relative',
                p: 0,
                mr: `${spacing}px`,
                ml: index === 0 ? `${spacing}px` : 0,
                height: `${imageHeight}px`,
                width: `${imageWidth}px`,
            }}
        >
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

            <SelectionMarker
                selected={selected}
                markerWidth={1}
                opacity={0}
                imageBorderWidth={0}
                withCheck={false}
            />

        </Box>
    );
});

export default Thumbnail;
