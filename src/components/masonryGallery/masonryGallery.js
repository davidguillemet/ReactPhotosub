
import { useState, useEffect, useRef } from 'react';
import {isMobile} from 'react-device-detect';
import Box from "@mui/material/Box";
import Alert from '@mui/material/Alert';
import { useResizeObserver } from '../../components/hooks';
import { withLoading, buildLoadingState } from '../../components/loading';
import MasonryLayout from './masonryLayout';

const _margin = isMobile ? 2 : 5;

const MasonryGallery = ({
    items,
    colWidth,
    heightProvider,
    renderItem = null,
    renderComponent = null,
    renderExtraParams = null,
    emptyMessage = null,
    onReady = null
}) => {

    const resizeObserver = useResizeObserver();
    const [masonryProps, setMasonryProps] = useState({
        itemWidth: colWidth,
        columnsCount: 0
    });
    const isReady = useRef(false);

    useEffect(() => {
        const containerWidth = resizeObserver.width;
        const columnsCount = Math.round((containerWidth + _margin) / (colWidth + _margin));
        const totalMargin = (columnsCount-1)*_margin;
        const itemWidth = Math.round((containerWidth - totalMargin) / columnsCount);
        setMasonryProps({
            itemWidth,
            columnsCount
        });
    }, [resizeObserver.width, colWidth])

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
                margin={_margin}
                renderItem={renderItem}
                renderComponent={renderComponent}
                renderExtraParams={renderExtraParams}
            />
        }
        </Box>
    )
};


export default withLoading(MasonryGallery, [buildLoadingState("items", [null, undefined])]);
