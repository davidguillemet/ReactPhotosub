import { Alert } from "@material-ui/core";

const ModuleNotFound = ({name}) => <Alert severity="error">{`Module '${name}' introuvable.` }</Alert>

export default ModuleNotFound;