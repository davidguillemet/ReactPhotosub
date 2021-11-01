import { styled } from '@mui/material/styles';

const Div = styled('div')(() => {});

const Spacing = ({direction, factor = 2}) => {
    const propName = direction === 'vertical' ? 'height' : 'width';
    return (
        <Div sx={{
            [propName]: (theme) => theme.spacing(factor)
        }}></Div>
    )
};

export const VerticalSpacing = ({factor}) => (
    <Spacing factor={factor} direction='vertical' />
)

export const HorizontalSpacing = ({factor}) => (
    <Spacing factor={factor} direction='horizontal' />
)
