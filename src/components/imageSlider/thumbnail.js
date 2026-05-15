import React from 'react';
import { useMemo } from 'react';
import { IconButton } from '@mui/material';
import Card from '@mui/material/Card';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LazyImage from '../lazyImage';
import SelectionMarker from '../selectionMarker';

const Thumbnail = React.forwardRef(({
    image,
    index,
    selectable = true,
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
        <Card
            ref={ref}
            sx={{
                position: 'relative',
                overflow: 'visible',
                borderWidth: 0,
                '&:hover': {
                    borderWidth: 0,
                },
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
                <IconButton
                    size="small"
                    disabled={image.deletable}
                    onClick={handleDelete}
                    style={{
                        position: 'absolute',
                        top: 5,
                        right: 5
                    }}
                    variant="light"
                >
                    <DeleteOutlineOutlinedIcon />
                </IconButton>
            }

            <SelectionMarker
                selected={selected}
                markerWidth={1}
                selectionMaskOpacity={selectable ? 0.3 : 0}
                imageBorderWidth={0}
                withCheck={false}
            />

        </Card>
    );
});

export default Thumbnail;
