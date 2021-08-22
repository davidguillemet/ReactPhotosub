import React, { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import { useIntersectionObserver } from '../hooks';
import {unstable_batchedUpdates} from 'react-dom';

const PlayerContainer = ({loaded, children}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (loaded === true) {
            containerRef.current.classList.add('loaded');
        }
    }, [loaded]);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                width: '100%',
                opacity: 0,
                transition: 'opacity 1.5s',
                '&.loaded': {
                    opacity: 1
                }        
            }}
        >
            {children}
        </Box>
    );
}

const Player = ({src}) => {

    const [videoSrc, setVideoSrc] = useState("");
    const [loaded, setLoaded] = useState(false);
    const setVideoSrcCallback = useCallback(() => {
        unstable_batchedUpdates(() => {
            setVideoSrc(src);
            setLoaded(true);
        });
    }, [src]);
    const frameRef = useIntersectionObserver(setVideoSrcCallback);

    return (
        <PlayerContainer loaded={loaded}>
            <iframe
                ref={frameRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black'                    
                }}
                src={videoSrc}
                title="Youtube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </PlayerContainer>
    );
}

const Video = ({src, legend = null, width = '100%'}) => {

    return (
        <Box sx={{
            width: width,
            mb: 3
        }}>
            <Player src={src} />
            { legend &&
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                    {legend}
                </Box>
            }
        </Box>
    )
}

export default Video;