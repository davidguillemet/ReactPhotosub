import InputBase from '@mui/material/InputBase';

const HiddenField = ({ fieldSpec, value }) => {
    return (
        <InputBase
            type="hidden"
            name={fieldSpec.field.id}
            value={value ?? ''}
            sx={{display: "none"}}
        />
    );
};

const validateHiddenField = () => {
    return true;
};

const HiddenFieldDef = [ HiddenField, validateHiddenField ];
export default HiddenFieldDef;