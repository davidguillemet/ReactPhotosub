import Box from '@material-ui/core/Box';
import { useVisible } from '../hooks';

const ItemContainer = ({item, index, top, left, width, height, renderItem}) => {

    const { isVisible, ref: containerRef } = useVisible();

    return (
        <Box
            key={item.id}
            ref={containerRef}
            sx={{
                display: 'block',
                position: 'absolute',
                transition: 'top 0.8s, left 0.8s, opacity 2000ms',
                overflow: 'hidden',
                top: top,
                left: left,
                maxWidth: width,
                width: width,
                height: height,
                // Transition opacity on visible
                opacity: isVisible ? 1 : 0,
            }}
        >
            {
                // Render item when the tile is visible
                isVisible && renderItem(item, index, width)
            }
        </Box>
    );
};

export default ItemContainer;