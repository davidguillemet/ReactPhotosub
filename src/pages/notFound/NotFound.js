import React from 'react';
import { PageTitle, PageHeader } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { Helmet404 } from '../../template/seo';
import { useTranslation } from 'utils';

const NotFound = (props) => {
    const t = useTranslation("pages.404");
    return (
        <React.Fragment>
            <Helmet404 />
            <PageTitle>{t("title")}</PageTitle>
            <PageHeader>{t("explanation")}</PageHeader>
            <VerticalSpacing factor={2} />
            <img alt="" src="/404.gif" />
        </React.Fragment>
    )
}

export default NotFound;