import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 400,
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: '0.58rem',
    border: `1px solid rgba(60,74,84,0.7)`,
  },
}));

export default HtmlTooltip;