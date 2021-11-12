import { useMemo } from 'react';
import { Fab } from '@mui/material';
import Box from '@mui/material/Box';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LazyImage from '../lazyImage';
import SelectionMarker from '../selectionMarker';

const Thumbnail = ({
    image,
    index,
    handleClick,
    selected,
    imageHeight,
    spacing,
    disabled,
    onDelete,
    renderOverlay = null}) => {

    const imageWidth = useMemo(() => Math.round(imageHeight * image.sizeRatio), [image, imageHeight])

    function handleDelete() {
        onDelete(image.src);
    }

    return (
        <Box sx={{
            position: 'relative',
            p: 0,
            mr: `${spacing}px`,
            ml: index === 0 ? `${spacing}px` : 0,
            height: `${imageHeight}px`,
            width: `${imageWidth}px`,
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
            {
                selected && <SelectionMarker imageBorderWidth={0} withCheck={false} />
            }

        </Box>
    );
};

export default Thumbnail;
