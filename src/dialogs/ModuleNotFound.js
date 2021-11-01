import { Alert } from "@mui/material";

const ModuleNotFound = ({name}) => <Alert severity="error">{`Module '${name}' introuvable.` }</Alert>

export default ModuleNotFound;