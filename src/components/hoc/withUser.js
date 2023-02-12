import { useAuthContext } from "../authentication"
import Alert from '@mui/material/Alert';
import { VerticalSpacing } from "../../template/spacing";
import React from "react";
import { Loading } from "./Loading";

const Unauthorized = ({admin}) => {
    return (
        <React.Fragment>
            <VerticalSpacing factor={2} />
            <Alert severity="warning" elevation={4} variant="filled">
            { 
                admin === true ?
                "Cette page n'est accessible qu'à l'administrateur" :
                "Cette page n'est accessible qu'aux utilisateurs connectés"
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