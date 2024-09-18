import { useTranslation } from 'utils';
import ErrorAlert from '../error';
import { Paragraph } from 'template/pageTypography';

const SearchResult = ({result}) => {
    const t = useTranslation("components.search");

    return (
        result.hasError ? <ErrorAlert /> :
        result.totalCount > 0 ? <Paragraph>{t("resultsCount", [result.totalCount, result.query])}</Paragraph> :
        result.totalCount === 0 ? <Paragraph>{t("noResults", result.query)}</Paragraph> :
        null
    )
};

export default SearchResult;