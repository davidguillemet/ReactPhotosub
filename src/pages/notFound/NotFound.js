import React from 'react';
import { PageTitle, PageHeader } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { Helmet404 } from '../../template/seo';

const NotFound = (props) => {

    return (
        <React.Fragment>
            <Helmet404 />
            <PageTitle>Oups...</PageTitle>
            <PageHeader>Il semblerait que la page que vous avez demandée n'existe pas ou a été supprimée.</PageHeader>
            <VerticalSpacing factor={2} />
            <img alt="" src="/404.gif" />
        </React.Fragment>
    )
}

export default NotFound;