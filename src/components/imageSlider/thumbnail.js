import Box from '@material-ui/core/Box';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

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
    disabled}) => {

    function onClick() {
        handleClick(index);
    }

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
            <Box style={{
                padding: imageBorderWidth,
                backgroundColor: active === true ? imageBorderColor : null,
                height: imageHeight + 2*imageBorderWidth,
                zIndex: 10,
                borderRadius: imageBorderRadius
            }}>
                <img
                    alt=""
                    src={image.src}
                    onLoad={onLoadedCallback}
                    onClick={onClick}
                    style={{
                        height: imageHeight,
                        cursor: 'pointer',
                        borderRadius: imageBorderRadius >= 2 ? imageBorderRadius-2 : 0,
                        opacity: disabled ? 0.7 : 1
                    }} />
            </Box>
            { active === true && <ArrowDropUpIcon color="primary" fontSize="large" style={{ position: 'relative', top: -10, zIndex: 5 }} />}
        </Box>
    );
};

export default Thumbnail;
