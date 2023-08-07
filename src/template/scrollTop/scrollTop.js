import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Zoom from '@mui/material/Zoom';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { throttle } from '../../utils';

const Div = styled('div')(() => {});

const ScrollTop = ({anchorSelector}) => {
    const [scroll, setScroll] = useState(0);

    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = (event) => {
        const anchor = (event.target.ownerDocument || document).querySelector(anchorSelector);

        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    React.useLayoutEffect(() => {
        const updateScroll = () => {
            const scrolled = document.documentElement.scrollTop;
            const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrolled / maxHeight) * 100;
            setScroll(scrollPercent);
        }
        const throttleUpdateScroll = throttle(updateScroll, 100, false, true);
        window.addEventListener("scroll", throttleUpdateScroll);
        window.addEventListener('resize', throttleUpdateScroll);
        return () => {
            window.removeEventListener('scroll', throttleUpdateScroll);
            window.removeEventListener('resize', throttleUpdateScroll);
        }
    }, []);

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
                    value={scroll < 100 ? scroll : 100}
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
