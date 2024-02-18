import React from 'react';
import { not, intersection, union } from './transferList';

const TransferContext = React.createContext(null);

export const TransferContextProvider = ({ allItems, rightList, sortFunc, children }) => {

    const [checked, setChecked] = React.useState([]);
    const [left, setLeft] = React.useState(not(allItems, rightList));
    const [right, setRight] = React.useState(rightList);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const isDirty = React.useRef(false);

    const numberOfChecked = React.useCallback((items) => intersection(checked, items).length, [checked]);

    const updateSelection = React.useCallback((selection) => {
        isDirty.current = true;
        setRight(selection);
    }, []);

    const handleToggle = React.useCallback((value) => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    }, [checked]);

    const handleToggleAll = React.useCallback((items) => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    }, [checked, numberOfChecked]);

    const handleAllRight = () => {
        updateSelection(right.concat(left));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        updateSelection(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        updateSelection(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = React.useCallback(() => {
        setLeft(left.concat(right));
        updateSelection([]);
    }, [left, right, updateSelection]);

    const transferContext = {
        handleToggle,
        handleToggleAll,
        handleAllRight,
        handleCheckedRight,
        handleCheckedLeft,
        handleAllLeft,
        left,
        right,
        checked,
        leftChecked,
        rightChecked,
        numberOfChecked,
        sortFunc,
        isDirty: isDirty.current
    };

    return (
        <TransferContext.Provider value={transferContext}>
            {children}
        </TransferContext.Provider>
    );
};

export function useTransferContext() {
    const context = React.useContext(TransferContext);
    if (context === undefined || context === null) {
        throw new Error("useTransferContext must be used within an TransferContextProvider");
    }
    return context;
}
