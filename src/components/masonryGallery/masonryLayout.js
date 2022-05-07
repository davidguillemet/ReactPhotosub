import React from 'react';
import { withLoading, buildLoadingState } from '../../components/hoc';
import ItemContainer from './itemContainer';

function getTargetColumnIndex(columnHeight) {

    let minHeight = Number.MAX_VALUE;
    let bestColumnIndex = 0;
    columnHeight.forEach((height, index) => {
        if (columnHeight[index] < minHeight) {
            minHeight = columnHeight[index];
            bestColumnIndex = index;
        }
    });
    return bestColumnIndex;
}

const MasonryLayout = withLoading(({items, itemWidth, columnsCount, margin, heightProvider, renderItem, renderComponent, renderExtraParams}) => {
    // Compute the cumulative height of each column
    const columnTopPosition = Array.from({length: columnsCount}, () => 0);
    
    return (
        <React.Fragment>
            {
                items.map((item, index) => {
                    const targetColumnIndex = getTargetColumnIndex(columnTopPosition);
                    const itemHeight = heightProvider(item, itemWidth);
                    const imageTop = columnTopPosition[targetColumnIndex] + margin;
                    columnTopPosition[targetColumnIndex] = imageTop + itemHeight;
                    return (
                        <ItemContainer
                            key={item.id}
                            index={index}
                            item={item}
                            top={imageTop}
                            left={targetColumnIndex*(itemWidth+margin)}
                            width={itemWidth}
                            height={itemHeight}
                            renderItem={renderItem}
                            renderComponent={renderComponent}
                            renderExtraParams={renderExtraParams}
                        />
                    );
                })
            }
            <div style={{
                zIndex: -1,
                visibility: 'hidden',
                height: Math.max(...columnTopPosition)
            }} />
        </React.Fragment>
    );
}, [ buildLoadingState("items", [null, undefined]), buildLoadingState("columnsCount", 0) ]);

export default MasonryLayout;