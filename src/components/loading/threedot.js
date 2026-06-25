import React from 'react';
import { styled } from '@mui/material/styles';

import './threedot.css';

const Div = styled('div')(({ theme }) => ({ }));

export const CustomLoading = ({sx, className = null, size = 60}) => {

    const ownClassName = "three-body"
    const consolidatedClassName =
     className ? 
     `${ownClassName} ${className}` :
     ownClassName;

    if (className) {

    }

    const defaultStyle = {
        position: sx?.position ?? "relative",
        display: sx?.display ?? "inline-block",
        width: `${size}px`,
        height: `${size}px`,
        ...(sx && { ...sx })
    };

    return (
        <Div className={consolidatedClassName} sx={defaultStyle}>
            <Div className="three-body__dot"></Div>
            <Div className="three-body__dot"></Div>
            <Div className="three-body__dot"></Div>
        </Div>
    )
};
