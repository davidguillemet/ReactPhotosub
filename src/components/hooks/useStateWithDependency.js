import { useState, useEffect } from 'react';

const useStateWithDependency = (stateDefaultValue) => {
    const [state, setState] = useState(stateDefaultValue);

    useEffect(() => {
        setState(stateDefaultValue);
    }, [stateDefaultValue])

    return [state, setState];
}

export default useStateWithDependency;