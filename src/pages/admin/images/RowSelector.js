import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import { useImageContext } from './ImageContext';

const RowSelector = ({row, selected}) => {

    const imageContext = useImageContext();

    const onChange = React.useCallback((event) => {
        const onRowSelected = imageContext.onRowSelected;
        onRowSelected(row, event.target.checked);
    }, [imageContext.onRowSelected, row]);

    return (
        <Checkbox
            color="primary"
            checked={selected}
            onChange={onChange}
        />

    );
}

export default RowSelector;