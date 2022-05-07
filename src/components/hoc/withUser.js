import { useAuthContext } from "../authentication"
import Alert from '@mui/material/Alert';
import { VerticalSpacing } from "../../template/spacing";
import React from "react";
import { Loading } from "./Loading";

const Unauthorized = () => {
    return (
        <React.Fragment>
            <VerticalSpacing factor={2} />
            <Alert severity="warning" elevation={4} variant="filled">Cette page n'est accessible qu'aux utilisateurs connectés</Alert>
        </React.Fragment>
    );
}

const withUser = (Component, alert = true) => (props) => {

    const authContext = useAuthContext();

    return (
        authContext.user === undefined ?
            <Loading size={40} /> :
            authContext.user !== null ?
                <Component {...props} /> :
                alert === true ?
                    <Unauthorized /> :
                    null
    )
}

export default withUser