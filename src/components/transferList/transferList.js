
import React from 'react';
import Box from '@mui/material/Box';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import MasonryGallery from 'components/masonryGallery';
import {isMobile} from 'react-device-detect';
import { Button, IconButton, Stack } from '@mui/material';
import { useTransferContext, TransferContextProvider } from './transferContext';
import { useToast } from 'components/notifications';

const SOURCE_LIST = 'src';
const TARGET_LIST = 'target';

export function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

export function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

export function union(a, b) {
  return [...a, ...not(b, a)];
}

const CustomMasonry = ({title, items, renderItem, type}) => {

    const transferContext = useTransferContext();

    const onToggleAll = React.useCallback(() => {
        const handleToggleAll = transferContext.handleToggleAll;
        handleToggleAll(items);
    }, [items, transferContext.handleToggleAll]);

    const heightProvider = React.useCallback((item, itemWidth) => {
        return itemWidth / item.sizeRatio;
    }, []);

    const numberOfChecked = transferContext.numberOfChecked(items);

    return (
        <Card sx={{px: 0, width: "100%", position: 'relative'}}>
            <CardHeader
                sx={{ px: 2, py: 1 }}
                avatar={
                    <Checkbox
                        onClick={onToggleAll}
                        checked={numberOfChecked === items.length && items.length !== 0}
                        indeterminate={numberOfChecked !== items.length && numberOfChecked !== 0}
                        disabled={items.length === 0}
                    />
                }
                title={title}
                subheader={`${numberOfChecked}/${items.length} selected`}
            />
            <Divider />
            <Box sx={{
                height: 400,
                p: 0.5,
                overflowX: 'hidden',
                overflowY: "scroll"
            }}>
                <MasonryGallery
                    items={items.sort(transferContext.sortFunc)}
                    colWidth={isMobile ? 155 : 155}
                    heightProvider={heightProvider}
                    renderComponent={renderItem}
                    renderExtraParams={{
                        onClick: transferContext.handleToggle,
                        checked: transferContext.checked,
                        isTarget: type === TARGET_LIST
                    }}
                />
            </Box>
        </Card>
    )
}

const TransferControls = () => {
    const transferContext = useTransferContext();

    return (
        <Stack direction='column'>
        <IconButton
            sx={{ my: 0.5 }}
            variant="outlined"
            size="large"
            onClick={transferContext.handleAllRight}
            disabled={transferContext.left.length === 0}
            aria-label="move all right"
        >
            <KeyboardDoubleArrowRightIcon fontSize='large'/>
        </IconButton>
        <IconButton
            sx={{ my: 0.5 }}
            variant="outlined"
            size="large"
            onClick={transferContext.handleCheckedRight}
            disabled={transferContext.leftChecked.length === 0}
            aria-label="move selected right"
        >
            <KeyboardArrowRightIcon fontSize='large'/>
        </IconButton>
        <IconButton
            sx={{ my: 0.5 }}
            variant="outlined"
            size="large"
            onClick={transferContext.handleCheckedLeft}
            disabled={transferContext.rightChecked.length === 0}
            aria-label="move selected left"
        >
            <KeyboardArrowLeftIcon fontSize='large'/>
        </IconButton>
        <IconButton
            sx={{ my: 0.5 }}
            variant="outlined"
            size="large"
            onClick={transferContext.handleAllLeft}
            disabled={transferContext.right.length === 0}
            aria-label="move all left"
        >
            <KeyboardDoubleArrowLeftIcon fontSize='large'/>
        </IconButton>
        </Stack>
    )
}

const TransferListUI = ({renderItem, onCancel}) => {
    const transferContext = useTransferContext();
    return (
        <Stack direction={'row'} alignItems='center' spacing={2} >
            <CustomMasonry title={""} items={transferContext.left} renderItem={renderItem} type={SOURCE_LIST} />
            <TransferControls />
            <CustomMasonry title={""} items={transferContext.right} renderItem={renderItem} type={TARGET_LIST} />
        </Stack>
    )
}

const TransferListWithContext = ({renderItem, onCancel, onValidate}) => {
    const transferContext = useTransferContext();
    const { toast } = useToast();

    const handleValidate = React.useCallback(() => {
        if (onValidate) {
            onValidate(transferContext.right)
            .then(() => {
                if (onCancel) {
                    onCancel();
                }
            }).catch((error) => {
                toast.error("Une erreur est survenue...")
            })
        }
    }, [onValidate, transferContext, toast, onCancel]);

    return (
        <Stack direction={'column'} spacing={2} sx={{height: "100%"}}>
            <TransferListUI renderItem={renderItem} onCancel={onCancel} />
            <Stack direction={'row'} alignItems='center' spacing={2} justifyContent={"flex-end"}>
                <Button variant="contained" onClick={handleValidate} disabled={!transferContext.isDirty}>Valider</Button>
                <Button variant="contained" onClick={onCancel}>Annuler</Button>
            </Stack>
        </Stack>
    )
};

const TransferList = ({allItems, rightList, renderItem, sortFunc, onCancel, onValidate}) => {
    return (
        <TransferContextProvider allItems={allItems} rightList={rightList} sortFunc={sortFunc} >
            <TransferListWithContext renderItem={renderItem} onCancel={onCancel} onValidate={onValidate} />
        </TransferContextProvider>
    )
}

export default TransferList;