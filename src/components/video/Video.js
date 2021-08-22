import React from 'react';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/core/Alert';

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

const YoutubePlayer = ({src}) => {

    return (
        <PlayerContainer>
            <iframe
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
                src={src}
                title="Youtube video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            />
        </PlayerContainer>
    );
}

const VimeoPlayer = ({src}) => {
    return (
        <PlayerContainer>
            <iframe
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black'
                }}
                src={src}
                title="Vimeo video"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen />
        </PlayerContainer>
    )
}

const PLAYER_YOUTUBE = "youtube.com";
const PLAYER_VIMEO = "vimeo.com";

const _players = {
    [PLAYER_YOUTUBE]: YoutubePlayer,
    [PLAYER_VIMEO]: VimeoPlayer
};

const Video = ({src, legend = null, width = '100%'}) => {

    const playerType =
        src.indexOf(PLAYER_YOUTUBE) >= 0 ?
        PLAYER_YOUTUBE :
        src.indexOf(PLAYER_VIMEO) >= 0 ?
        PLAYER_VIMEO : null;

    if (playerType === null) {
        return <Alert sx={{mb: 3}} severity="error" elevation={4} variant="filled">{`This video source '${src}' is not supported`}</Alert>
    }

    const Player = _players[playerType];

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