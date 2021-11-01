import { useVisible } from '../hooks';
import Grow from '@mui/material/Grow';

/**
 * 
 * @param {any} Component The Component to enhance with lazy behavior
 */
 export const lazyComponent = (Component) => (props) => {

    const { isVisible, ref } = useVisible();

    return (
        <Grow in={isVisible} timeout={1000}>
            <div ref={ref} style={{ width: '100%'}}>
            {
                isVisible === true ?
                <Component {...props} /> :
                null
            }
            </div>
        </Grow>
    );
}

export default lazyComponent;
