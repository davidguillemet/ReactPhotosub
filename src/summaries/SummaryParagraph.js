import React from 'react';
import { VerticalSpacing } from '../template/spacing';
import DialogContentText from '@material-ui/core/DialogContentText';

const SummaryParagraph = ({children, textAlign = 'justify'}) => {
    return (
        <React.Fragment>
            <DialogContentText sx={{
                textAlign: textAlign,
                '&::first-letter': {
                    fontSize: '130%',
                    fontWeight: 'bold'
                }
            }}>
                {children}
            </DialogContentText>
            <VerticalSpacing factor={1} />
        </React.Fragment>
    )
}

export default SummaryParagraph;