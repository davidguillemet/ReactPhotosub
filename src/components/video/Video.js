import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@material-ui/core/Box';

const PlayerContainer = ({children}) => {
    return (
        <div style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                width: '100%'
            }}
        >
            {children}
        </div>
    );
}

const Player = ({src}) => {

    const intersectionObserver = useRef(null);
    const [videoSrc, setVideoSrc] = useState("");

    const setFrameRef = useCallback((frameRef) => {
        if (frameRef !== null) {
            if (IntersectionObserver) {
                if (intersectionObserver.current !== null) {
                    intersectionObserver.current.unobserve(frameRef)
                }
                intersectionObserver.current = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            // when image is visible in the viewport + rootMargin
                            if ((entry.intersectionRatio > 0 || entry.isIntersecting)) {
                                    setVideoSrc(src)
                            }
                        })
                    }
                )
                intersectionObserver.current.observe(frameRef)
            } else {
                // Old browsers fallback
                setVideoSrc(src)
            }
        }
    }, [src]);

    useEffect(() => () => {
        intersectionObserver.current.disconnect();
    }, []);
    

    return (
        <PlayerContainer>
            <iframe
                ref={setFrameRef}
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
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
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