import { useLayoutEffect } from 'react';
import { gsap } from "gsap";
import { useVisible } from '../hooks';
import Box from '@mui/material/Box';

const ItemContainer = ({item, index, top, left, width, height, renderItem, renderComponent, renderExtraParams}) => {

    const { isVisible, ref: containerRef, element } = useVisible();

    useLayoutEffect(() => {
        if (isVisible) {
            gsap.from(element, {duration: 0.7, y: 120, scale: 0});
            gsap.to(element, {duration: 0.7, opacity: 1});
        }
    }, [isVisible, element])

    const displayItem = () => {
        // Render item when the tile is visible
        if (isVisible === false) return null
        if (renderItem !== null) {
            return renderItem(item, index, width);
        } else if (renderComponent !== null) {
            const RenderComponent = renderComponent;
            return <RenderComponent item={item} index={index} width={width} params={renderExtraParams} />
        }
        throw new Error("Missing Masonrylayout rendered");
    }

    return (
        <Box
            key={item.id}
            ref={containerRef}
            sx={{
                display: 'block',
                position: 'absolute',
                transition: 'top 0.8s, left 0.8s',
                overflow: 'hidden',
                top: top,
                left: left,
                maxWidth: width,
                width: width,
                height: height,
                opacity: 0
            }}
        >
            { displayItem() }
        </Box>
    );
};

export default ItemContainer;