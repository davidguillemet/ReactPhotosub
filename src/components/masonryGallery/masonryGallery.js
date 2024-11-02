
import { useState, useEffect } from 'react';
import {isMobile} from 'react-device-detect';
import Box from "@mui/material/Box";
import Alert from '@mui/material/Alert';
import { useResizeObserver } from '../../components/hooks';
import { withLoading, buildLoadingState, Loading } from '../../components/hoc';
import MasonryLayout from './masonryLayout';

const _margin = isMobile ? 5 : 15;

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
    const [isReady, setIsReady] = useState(false);

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
        if (isReady === false && masonryProps.columnsCount > 0) {
            setIsReady(true);
        }
    }, [masonryProps, isReady])

    useEffect(() => {
        if (isReady === true && onReady !== null) {
            onReady();
        }
    }, [isReady, onReady])

    if (items.length === 0 && emptyMessage !== null) {
        return (
            <Alert severity="info" elevation={4} variant="filled">{emptyMessage}</Alert>
        );
    }

    return (
        <Box sx={{position: 'relative', width: '100%'}} ref={resizeObserver.ref}>
        {
            isReady === false ?
            <Loading></Loading> :
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
