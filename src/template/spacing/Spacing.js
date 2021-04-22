import { withTheme } from '@material-ui/core/styles';

const Spacing = ({direction, factor, theme}) => {
    const propName = direction === 'vertical' ? 'height' : 'width';
    return (
        <div style={{
            [propName]: theme.spacing(factor)
        }}></div>
    )
}

const SpacingWithTheme = withTheme(Spacing);

export const VerticalSpacing = ({factor}) => (
    <SpacingWithTheme factor={factor} direction='vertical' />
)

export const HorizontalSpacing = ({factor}) => (
    <SpacingWithTheme factor={factor} direction='horizontal' />
)
