import React from 'react';
import Container from '@mui/material/Container';
import { Outlet} from "react-router-dom";
import { ToastNotifications } from '../../components/notifications';

const PageContent = React.forwardRef((props, ref) => {

    return (
        <Container
            ref={ref}
            sx={{
                width: 'unset',
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                flexWrap: 'wrap',
                alignItems: 'center',
                textAlign: 'center',
                mx: {
                    "xs": 1,
                    "sm": 2,
                    "md": 3
                },
                my: 0,
                p: 0,
                pb: 3
            }}
            disableGutters={true}
            maxWidth={false}
            {...props}
        >
            <Outlet />
            <ToastNotifications />
        </Container>
    );
});

export default PageContent;