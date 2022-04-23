import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LazyImage from "../lazyImage";

const SelectControl = ({field, value, values, handleChange, sending}) => {

    // TODO : don't call field.options on each render...
    const options = field.options(field.dependsOn ? field.dependsOn.map(dependency => values[dependency] ) : null);

    const valueProperty = field.mapping ? field.mapping["value"] : "id";
    const captionProperty = field.mapping ? field.mapping["caption"] : "title";
    const keyProperty = field.mapping ? field.mapping["key"] : "id";

    return (
        <FormControl fullWidth>
            <InputLabel id="select-label">{field.Label}</InputLabel>
            <Select
                labelId="select-label"
                name={field.id}
                value={options !== undefined ? value : ""}
                label={field.label}
                onChange={handleChange}
                fullWidth
                disabled={sending}
            >
            {
                options ?
                options.map(option => (
                    <MenuItem key={option[keyProperty]} value={option[valueProperty]}>
                        {
                            option.src ?
                            <LazyImage
                                image={option}
                                width={200}
                                withOverlay={false}
                                withFavorite={false}
                            />
                            :
                            option[captionProperty]
                        }
                    </MenuItem>)) :
                null
            }
            </Select>
        </FormControl>
    )
}

const FormField = ({ field, value, values, handleChange, sending }) => {

    if (field.type === "switch") {
        return (
            <FormControlLabel
                control={
                    <Switch
                        onChange={handleChange}
                        id={field.id}
                        color="primary"
                        checked={value}
                />}
                label={field.label}
            />
        )
    } else if (field.type === 'select') {
        return <SelectControl field={field} value={value} values={values} handleChange={handleChange} sending={sending} />
    } else {
        return (
            <TextField
                key={field.id}
                id={field.id}
                label={field.label}
                value={value}
                variant="outlined"
                fullWidth
                margin="normal"
                required={field.required}
                type={field.type}
                multiline={field.multiline}
                minRows="10"
                onChange={handleChange}
                error={field.error}
                helperText={field.error ? field.errorText : ''}
                disabled={sending}
            />
        )
    }
}

export default FormField;
