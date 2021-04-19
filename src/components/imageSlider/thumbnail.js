import Box from '@material-ui/core/Box';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

const Thumbnail = ({ image, index, handleClick, active, onLoadedCallback}) => {

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
                padding: 3,
                backgroundColor: active === true ? 'black' : null,
                height: 66,
                zIndex: 10
            }}>
                <img
                    alt=""
                    src={image.src}
                    onLoad={onLoadedCallback}
                    onClick={onClick}
                    style={{
                        height: '100%',
                        cursor: 'pointer'
                    }} />
            </Box>
            { active === true && <ArrowDropUpIcon color="primary" fontSize="large" style={{ position: 'relative', top: -10, zIndex: 5 }} />}
        </Box>
    );
};

export default Thumbnail;
