import React from 'react';
import { ReactRouterAwaiter } from 'components/reactRouter';
import { Grow, Snackbar } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { PageTitle, Paragraph } from 'template/pageTypography';
import TooltipIconButton from 'components/tooltipIconButton';
import { usePortfolio } from 'providers';
import { PORTFOLIO_INTENT_ADD, PORTFOLIO_INTENT_REMOVE } from 'utils/portfolio/portfolioIntents';
import { useAsyncFetcher } from 'components/reactRouter';
import { APP_ROUTE_PATH } from 'navigation/routes';
import { HierarchicalGroupGallery } from 'components/gallery';
import { GroupBuilderFactory} from './groupBuilder';
import { useLanguage, useTranslation } from 'utils';
import { useAuthContext } from 'components/authentication';
import { useLoaderData } from 'react-router';
import categoryAdminToolsFactory from './admin/CategoryAdminTools';
import CategoryImageAdminTools from './admin/CategoryImageAdminTools';
import useAdminActions from './admin/UseAdminActions';
import { useToast } from 'components/notifications';

const GROUP_BY_CATEGORY = 'category';
const GROUP_BY_DESTINATION = 'destination';
const GROUP_BY_DATE = 'date';
const GROUP_NONE = 'none';
const DEFAULT_GROuPiNG = GROUP_BY_CATEGORY;

const PortfolioGallery = ({images, categories}) => {
    const authContext = useAuthContext();
    const { language } = useLanguage();
    const t = useTranslation("pages.portfolio");
    const [selectedGrouping, setSelectedGrouping] = React.useState(DEFAULT_GROuPiNG);

    const {
        dateGroupBuilder,
        destinationGroupBuilder,
        categoryGroupBuilder
    } = React.useMemo(() => GroupBuilderFactory(categories, language, t, authContext.admin), [categories, language, t, authContext.admin]);

    const { AdminActions, onEditCategory, onClickDeleteCategory } = useAdminActions();

    const groupOptions = React.useMemo(() => {
        const categoryAdminTools = categoryAdminToolsFactory(categories, onEditCategory, onClickDeleteCategory);
        const options = [
            { value: GROUP_BY_CATEGORY,    label: t("groupBy:category"),    groupLabel: t("groupLabel:category"),    groupBuilder: categoryGroupBuilder    , adminTools: categoryAdminTools, imageAdminTools: CategoryImageAdminTools },
            { value: GROUP_BY_DESTINATION, label: t("groupBy:destination"), groupLabel: t("groupLabel:destination"), groupBuilder: destinationGroupBuilder , adminTools: null,               imageAdminTools: null },
            { value: GROUP_BY_DATE,        label: t("groupBy:date"),        groupLabel: t("groupLabel:date"),        groupBuilder: dateGroupBuilder        , adminTools: null,               imageAdminTools: null }
        ]
        if (authContext.admin) {
            options.push({
                value: GROUP_NONE,
                label: t("groupBy:none"),
                groupLabel: "",
                groupBuilder: null
            });
        }
        return options;
    }, [
        t,
        destinationGroupBuilder,
        dateGroupBuilder,
        categoryGroupBuilder,
        onEditCategory,
        onClickDeleteCategory,
        authContext.admin,
        categories
    ]);

    const onGroupingChanged = React.useCallback((grouping) => {
        setSelectedGrouping(grouping);
    }, []);

    return (
        <React.Fragment>
            <HierarchicalGroupGallery
                groupingOptions={groupOptions}
                images={images}
                defaultGroupingValue={GROUP_BY_CATEGORY}
                onGroupingChanged={onGroupingChanged}
            />
            { selectedGrouping === GROUP_BY_CATEGORY && <AdminActions /> }
        </React.Fragment>
    );
};

const Portfolio = () => {
    const { toast } = useToast();
    const { categories } = useLoaderData();
    const authContext = useAuthContext();
    const t = useTranslation("pages.portfolio");
    const portfolioContext = usePortfolio();
    const [ removedFromPortfolio, setRemovedFromPortfolio ] = React.useState([]);
    const [ undoRunning, setUndoRunning ] = React.useState(false);

    const { submit: fetcherSubmit } = useAsyncFetcher("portfolioButton", APP_ROUTE_PATH);

    const portfolioAction = React.useCallback((images, action) => {
        switch (action) {
            case PORTFOLIO_INTENT_REMOVE:
                setRemovedFromPortfolio(prevRemoved => [...prevRemoved, ...images ]);
                break;
            case PORTFOLIO_INTENT_ADD:
                // filter prevRemoved to remove all items from images
                setRemovedFromPortfolio(prevRemoved => prevRemoved.filter(prevImg => images.findIndex(img => img.id === prevImg.id) === -1))
                break;
            default:
                throw new Error(`Unknown portfolio action '${action}'`)
        }
    }, []);

    React.useEffect(() => {
        const subscribe = portfolioContext.subscribe;
        const unsubscribe = portfolioContext.unsubscribe;
        subscribe(portfolioAction);
        return () => unsubscribe(portfolioAction);
    }, [portfolioAction, portfolioContext.subscribe, portfolioContext.unsubscribe])

    const handleUndo = () => {
        setUndoRunning(true);
        const submitData = {
            intent: PORTFOLIO_INTENT_ADD,
            ids: removedFromPortfolio
        }
        fetcherSubmit(submitData)
        .then(() => {
            setRemovedFromPortfolio([]);
        }).catch(e => {
            toast.error(e.message);
        }).finally(() => {
            setUndoRunning(false);
        });
    }

    const undoAction = (
        <TooltipIconButton
            tooltip={t("btn:cancelDeletion")}
            size="small"
            onClick={handleUndo}
            loading={undoRunning}
            loadingPosition="end"
        >
            <UndoIcon size="small" />
        </TooltipIconButton>
    );

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            {
                authContext.admin &&
                <Paragraph>{`${portfolioContext.portfolio.length} images`}</Paragraph>
            }
            <ReactRouterAwaiter value={categories}>
                {categories => <PortfolioGallery images={portfolioContext.portfolio} categories={categories}/>}
            </ReactRouterAwaiter>

            <Snackbar
                open={removedFromPortfolio.length > 0}
                message={t("info:portfolioImagesDeleted", removedFromPortfolio.length)}
                action={undoAction}
                slots={{ transition: Grow }}
            />
        </React.Fragment>
    );
};

export default Portfolio;

export const Component = Portfolio;
