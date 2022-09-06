import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Zoom from '@mui/material/Zoom';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Div = styled('div')(() => {});

const ScrollTop = (props) => {
    const { anchorSelector, scrollTop, fullHeight, containerHeight } = props;    

    const handleClick = (event) => {
        const anchor = (event.target.ownerDocument || document).querySelector(anchorSelector);

        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const trigger = scrollTop >= 100;
    const maxScroll = fullHeight - containerHeight; // 5234.75 - 901 = 4333.75
    const progress = trigger ? scrollTop * 100 / maxScroll : 0;   // 4334 * 100 / 4333.75 = 100.005769

    return (
        <Zoom in={trigger}>
            <Div
                onClick={handleClick}
                role="presentation"
                sx={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: (theme) => theme.zIndex.appBar
                }}
            >
                <CircularProgress
                    variant="determinate"
                    thickness={6}
                    value={progress < 100 ? progress : 100}
                    size={58}
                    sx={{
                        color: green[500],
                        position: 'absolute',
                        top: -5,
                        left: -5,
                        zIndex: 0,
                    }}
                />
                <Fab color="secondary" size="medium" aria-label="scroll back to top">
                    <KeyboardArrowUpIcon />
                </Fab>
            </Div>
        </Zoom>
    );
}

export default ScrollTop;
