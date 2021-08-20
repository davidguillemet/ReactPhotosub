import { Fab } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { getThumbnailSrc, THUMB_S } from '../../utils/utils';

const Thumbnail = ({
    image,
    index,
    handleClick,
    active,
    onLoadedCallback,
    imageHeight,
    imageBorderWidth = 3,
    imageBorderColor = "#000",
    imageBorderRadius = 3,
    disabled,
    onDelete}) => {

    function onClick() {
        handleClick(index);
    }

    function handleDelete() {
        onDelete(image.src);
    }

    function handleLoaded() {
        if (onLoadedCallback) {
            onLoadedCallback(image.id);
        }
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
                <img
                    alt=""
                    src={getThumbnailSrc(image, imageHeight * image.sizeRatio, THUMB_S)}
                    onLoad={handleLoaded}
                    onClick={onClick}
                    style={{
                        height: imageHeight,
                        cursor: 'pointer',
                        borderRadius: imageBorderRadius >= 2 ? imageBorderRadius-2 : 0,
                        opacity: disabled ? 0.7 : 1
                    }}
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
