import React, { useState } from 'react';
import Alert from '@material-ui/core/Alert';
import Dialog from '@material-ui/core/Dialog';
import LazyImage from '../lazyImage/image';
import ExpandedView from './expandedView';
import {unstable_batchedUpdates} from 'react-dom';
import { withLoading, buildLoadingState } from '../../components/loading';
import MasonryGallery from '../masonryGallery';

const Gallery = ({ images, colWidth, margin, emptyMessage = null, onReady = null}) => {
    const [expandedImageIndex, setExpandedImageIndex] = useState(null);
    const [expandedViewOpen, setExpandedViewOpen] = useState(false);

    function onImageClick(imageIndex) {
        unstable_batchedUpdates(() => {
            setExpandedImageIndex(imageIndex);
            setExpandedViewOpen(true);
        });
    }

    function onCloseModal(/*event, reason*/) {
        setExpandedViewOpen(false);
    }

    if (images.length === 0 && emptyMessage !== null) {
        return (
            <Alert severity="info" elevation={4} variant="filled">{emptyMessage}</Alert>
        );
    }

    const renderItem = (item, index, width) => (
        <LazyImage
            index={index}
            image={item}
            onClick={onImageClick}
            width={width}
        />
    );

    return (
        <React.Fragment>

            <MasonryGallery
                items={images}
                colWidth={colWidth}
                heightProvider={(item, itemWidth) => itemWidth / item.sizeRatio}
                margin={margin}
                renderItem={renderItem}
                onReady={onReady}
            />

            <Dialog
                open={expandedViewOpen}
                onClose={onCloseModal}
                fullScreen={true}
            >
                <ExpandedView images={images} index={expandedImageIndex} onClose={onCloseModal} />
            </Dialog>
        </React.Fragment>
    );
}

export default withLoading(Gallery, [buildLoadingState("images", [null, undefined])]);