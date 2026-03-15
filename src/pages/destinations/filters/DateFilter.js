import React from 'react';
import { useTranslation } from 'utils';
import AutoCompleteTagInput from 'components/input';

const DateFilter = ({destinations, onChange}) => {
    const t = useTranslation("pages.destinations.dateFilter");

    const options = React.useMemo(() => {
        // destination.date = '2022-11-18T00:00:00.000Z'
        const years = new Set(destinations.map(dest => new Date(dest.date).getFullYear().toString()));
        const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort years in descending order
        return sortedYears.map(year => ({
            label: year,
            id: year
        }));
    } , [destinations]);

    const handleChange = React.useCallback((selectedOptions) => {
        const selectedYears = new Set(selectedOptions.map(option => option.label));
        onChange(selectedYears);
    }, [onChange]);

    return (
        <AutoCompleteTagInput
            options={options}
            onChange={handleChange}
            noOptionsText={t("noAvailableYears")}
            placeholder={t("label")}
            helperText={t("helperText")}
            enableLastSelected={false}
        />
    )
}

export default DateFilter;