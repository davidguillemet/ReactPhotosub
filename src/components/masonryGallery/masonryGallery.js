
import { useState, useEffect, useRef } from 'react';
import Box from "@material-ui/core/Box";
import Alert from '@material-ui/core/Alert';
import { useResizeObserver } from '../../components/hooks';
import { withLoading, buildLoadingState } from '../../components/loading';
import MasonryLayout from './masonryLayout';

const MasonryGallery = ({items, colWidth, heightProvider, margin = 5, renderItem, emptyMessage = null, onReady = null}) => {

    const resizeObserver = useResizeObserver();
    const [masonryProps, setMasonryProps] = useState({
        itemWidth: colWidth,
        columnsCount: 0
    });
    const isReady = useRef(false);

    useEffect(() => {
        const containerWidth = resizeObserver.width;
        const columnsCount = Math.round((containerWidth + margin) / (colWidth + margin));
        const totalMargin = (columnsCount-1)*margin;
        const itemWidth = Math.round((containerWidth - totalMargin) / columnsCount);
        setMasonryProps({
            itemWidth,
            columnsCount
        });
    }, [resizeObserver.width, colWidth, margin])

    useEffect(() => {
        if (isReady.current === false && masonryProps.columnsCount > 0 && onReady !== null) {
            isReady.current = true;
            onReady();
        }
    }, [masonryProps, onReady])

    if (items.length === 0 && emptyMessage !== null) {
        return (
            <Alert severity="info" elevation={4} variant="filled">{emptyMessage}</Alert>
        );
    }

    return (
        <Box sx={{position: 'relative', width: '100%'}} ref={resizeObserver.ref}>
        {
            <MasonryLayout
                items={items}
                itemWidth={masonryProps.itemWidth}
                heightProvider={heightProvider}
                columnsCount={masonryProps.columnsCount}
                margin={margin}
                renderItem={renderItem}
            />
        }
        </Box>
    )
};


export default withLoading(MasonryGallery, [buildLoadingState("items", [null, undefined])]);
