import { useAuthContext } from "../authentication"
import Alert from '@mui/material/Alert';
import { VerticalSpacing } from "../../template/spacing";
import React from "react";
import { Loading } from "./Loading";
import { useTranslation } from "utils";

const Unauthorized = ({admin}) => {
    const t = useTranslation("components.hoc.withUser")
    return (
        <React.Fragment>
            <VerticalSpacing factor={2} />
            <Alert severity="warning" elevation={4} variant="filled">
            { 
                admin === true ? t("adminRestriction") : t("userRestriction")
            }
            </Alert>
        </React.Fragment>
    );
}

const withUser = (Component, options = { alert: true, admin: false }) => (props) => {

    const authContext = useAuthContext();

    return (
        authContext.user === undefined ?
            <Loading size={40} /> : // User not yet loaded
            authContext.user !== null && (options.admin === false || authContext.admin === true) ?
                <Component {...props} /> :
                options.alert === true ?
                    <Unauthorized admin={options.admin}/> : // Connected user required (maybe admin)
                    null               // the component is just not displayed
    )
}

export default withUser