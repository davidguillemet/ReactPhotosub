import React from 'react';
import { TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const KeyWordFilter = ({onChange}) => {

    const [filter, setFilter] = React.useState("");
    const [error, setError] = React.useState(false);
    const searchTimer = React.useRef(null);

    const handleChange = (event, immediate) => {
        setFilter(event.target.value);
        if (onChange) {
            if (searchTimer.current !== null) {
                clearTimeout(searchTimer.current);
            }
            const fullString = event.target.value.trim();
            if (fullString.length < 3 && fullString.length > 0) {
                setError(true);
                return;
            } else {
                setError(false);
            }
            const keywordSet = new Set(fullString.split(" ").map(keyword => keyword.trim()).filter(keyword => keyword.length > 0));
            if (immediate === true) {
                onChange(keywordSet);
            } else {
                // Debounce the search to avoid too many calls while the user is typing
                searchTimer.current = setTimeout(onChange, 500, keywordSet);
            }
        }
    };

    return (
        <React.Fragment>
            <TextField
                id="keyword-filter"
                value={filter}
                label="Filtrer par mots clés"
                variant="outlined"
                fullWidth
                error={error}
                helperText={error ? "Veuillez saisir au moins 3 caractères" : "Saisissez des mots clés pour affiner votre recherche"}
                onChange={handleChange}
                slotProps={{
                    input: {
                        endAdornment: (
                            <IconButton
                                color="inherit"
                                disabled={filter.length === 0}
                                onClick={() => handleChange({target: {value: ""}}, true)}
                                size='small'
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )
                    }
                }}
            />
        </React.Fragment>
    );
};

export default KeyWordFilter;