import React from 'react';
import { styled } from '@mui/material/styles';
import { getThumbnailSrc } from 'utils';
import ImageDetails from './ImageDetails';

const MainImageStyled = styled('img')({
    display: 'block',
    minHeight: '100%',
    minWidth : '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover' // prevent image from shrinking when window width is too small
});

const _imageSizeRatio = 600 / 400; // always landscape

const MainImage = ({images, currentImageIndex, handleImageLoaded, width, height}) => {

    // If the height is less than the image height which width is the available width, all is ok
    // -> get the thumbnail with the same width as the available width
    const availableWidth = width;
    const availableHeight = height;
    const currentImage = images[currentImageIndex % images.length];

    let thumbnailWidth = availableWidth;
    const imageSizeRatio = currentImage.sizeRatio ?? _imageSizeRatio;
    const thumbnailHeight = thumbnailWidth / imageSizeRatio;
    if (thumbnailHeight < availableHeight) {
        // Consider the image height and calculate the new thumbnail width
        thumbnailWidth = availableHeight * imageSizeRatio;
    }

    const currentImageSrc = React.useMemo(() => getThumbnailSrc(currentImage, thumbnailWidth), [currentImage, thumbnailWidth]);

    return (
        <React.Fragment>
            <MainImageStyled
                alt=""
                onLoad={handleImageLoaded}
                src={currentImageSrc}
            />
            {
                currentImage.destination && <ImageDetails image={currentImage} />
            }
        </React.Fragment>
    )
};

export default MainImage;
