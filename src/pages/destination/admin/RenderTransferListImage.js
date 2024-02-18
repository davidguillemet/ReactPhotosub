import React from 'react';
import Box from '@mui/material/Box';
import LazyImage from 'components/lazyImage';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import { useGroupContext } from './GroupContext';

const renderSelectionOverlay = (selected, image, isTarget, group) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                color: "#fff",
                backgroundColor: `rgba(0, 0, 0, ${selected === true ? '0.4' : '0.0'})`
            }}
        >
            {selected === true && <CheckIcon fontSize='large' />}
            {isTarget === false && image.sub_gallery_id !== null &&  image.sub_gallery_id !== group.gallery.id &&
                <StarIcon
                    fontSize='medium'
                    sx={{
                        position: 'absolute',
                        right: '5px',
                        bottom: '5px'
                    }} />}
        </Box>
    );
};

export const RenderTransferListImage = ({ item, index, width, params }) => {
    const group = useGroupContext();
    const [selected, setSelected] = React.useState(false);

    React.useLayoutEffect(() => {
        setSelected(params.checked.indexOf(item) !== -1);
    }, [params, item]);

    const handleOnClick = React.useCallback(() => {
        const { onClick } = params;
        if (onClick) {
            onClick(item);
        }
        setSelected(selected => !selected);
    }, [item, params]);

    const renderSelectedOverlay = React.useCallback(() => renderSelectionOverlay(true, item, params.isTarget, group), [item, params, group]);
    const renderNotSelectedOverlay = React.useCallback(() => renderSelectionOverlay(false, item, params.isTarget, group), [item, params, group]);

    return (
        <LazyImage
            image={item}
            width={width}
            withOverlay={false}
            withFavorite={false}
            onClick={handleOnClick}
            renderOverlay={selected === true ? renderSelectedOverlay : renderNotSelectedOverlay}
            disabled={!params.isTarget && item.sub_gallery_id !== null && item.sub_gallery_id !== group.gallery.id} />
    );
};
