import { useVisible } from '../hooks';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';

const PlaceHolderComponent = ({width, height}) => {
    return (
        <Box sx={{
            ...(width && { width: `${width}px` }),
            ...(height && { height: `${height}px` }),
        }} />
    );
}

/**
 * 
 * @param {any} Component The Component to enhance with lazy behavior
 */
 export const lazyComponent = (Component, placeHolderProps) => (props) => {

    const { isVisible, ref } = useVisible();

    return (
        <Fade in={isVisible} timeout={1000}>
            <div ref={ref} style={{ width: '100%'}}>
            {
                isVisible === true ?
                <Component {...props} /> :
                <PlaceHolderComponent {...placeHolderProps} />
            }
            </div>
        </Fade>
    );
}

export default lazyComponent;
