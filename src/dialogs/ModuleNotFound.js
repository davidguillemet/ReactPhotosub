import { Alert } from "@mui/material";
import { useTranslation } from "utils";

const ModuleNotFound = ({name}) => {
    const t = useTranslation("dialogs")
    return (
        <Alert severity="error">{t("moduleNotFound", name)}</Alert>
    )
};

export default ModuleNotFound;