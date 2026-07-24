import React, { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ConfirmDialog from 'dialogs/ConfirmDialog';
import { useQueryContext } from 'components/queryContext';
import { useReactQuery } from 'components/reactQuery';
import { buildLoadingState, withLoading } from 'components/hoc';
import { useToast } from 'components/notifications';
import { useTranslation } from 'utils';
import { Stack } from '@mui/material';

const isOrphan = (user) => user.hasUserData && !user.hasFirebaseAccount;

const UsersTable = withLoading(({ users }) => {
    const t = useTranslation("pages.admin.users");
    const queryContext = useQueryContext();
    const { toast } = useToast();
    const deleteUsersMutation = queryContext.useDeleteManagedUsers();

    // deleteTargets: null | array of user objects — a single row delete or the full
    // orphan-purge batch, both funneled through the same confirm dialog and mutation.
    const [deleteTargets, setDeleteTargets] = useState(null);

    const orphanUsers = useMemo(() => users.filter(isOrphan), [users]);

    const handleDeleteRequest = useCallback((e, user) => {
        e.stopPropagation();
        setDeleteTargets([user]);
    }, []);

    const handlePurgeRequest = useCallback(() => {
        if (orphanUsers.length > 0) {
            setDeleteTargets(orphanUsers);
        }
    }, [orphanUsers]);

    const handleDelete = useCallback(() => {
        if (!deleteTargets) return undefined;
        const uids = deleteTargets.map(user => user.uid);
        return deleteUsersMutation.mutateAsync(uids).then(() => {
            toast.success(
                deleteTargets.length === 1
                    ? t("success:deleted")
                    : t("success:purged", deleteTargets.length)
            );
        }).catch((error) => {
            toast.error(t("error:delete", [error.message]));
        });
    }, [deleteUsersMutation, deleteTargets, toast, t]);

    return (
        <Stack direction="column" spacing={2} sx={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Button
                disabled={orphanUsers.length === 0}
                onClick={handlePurgeRequest}
            >
                {t("btn:purgeOrphans", orphanUsers.length)}
            </Button>
            <TableContainer sx={{ backgroundColor: 'background.paper', width: '100%' }}>
                <Table
                    size="small"
                    sx={{
                        borderStyle: 'solid',
                        borderWidth: 1,
                        borderColor: 'divider',
                        '& tr:last-child td': {
                            borderBottom: 'none',
                        },
                    }}
                >
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'background.paperLight' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t("col:user")}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t("col:displayName")}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '1%', whiteSpace: 'nowrap' }}>
                                <Tooltip title={t("col:favorites")}>
                                    <FavoriteBorderOutlinedIcon fontSize="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '1%', whiteSpace: 'nowrap' }}>
                                <Tooltip title={t("col:collections")}>
                                    <CollectionsBookmarkOutlinedIcon fontSize="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '1%', whiteSpace: 'nowrap' }}>
                                <Tooltip title={t("col:status")}>
                                    <InfoOutlinedIcon fontSize="small" />
                                </Tooltip>
                            </TableCell>
                            <TableCell sx={{ width: '1%' }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => {
                            const isAnomaly = user.hasFirebaseAccount !== user.hasUserData;
                            const canDelete = isOrphan(user);
                            const statusTooltip = !user.hasFirebaseAccount
                                ? t("status:noFirebaseAccount")
                                : !user.hasUserData
                                    ? t("status:noUserData")
                                    : null;
                            return (
                                <TableRow
                                    key={user.uid}
                                    sx={isAnomaly ? (theme) => ({ backgroundColor: alpha(theme.palette.warning.main, 0.1) }) : undefined}
                                >
                                    <TableCell>
                                        <Typography variant="subtitle1">{user.email ?? user.uid}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle1">{user.displayName ?? '—'}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {user.hasFavorites === null ? '—' : user.hasFavorites && <CheckCircleOutlinedIcon fontSize="small" color="success" />}
                                    </TableCell>
                                    <TableCell align="center">
                                        {user.hasCollections === null ? '—' : user.hasCollections && <CheckCircleOutlinedIcon fontSize="small" color="success" />}
                                    </TableCell>
                                    <TableCell align="center">
                                        {isAnomaly && (
                                            <Tooltip title={statusTooltip}>
                                                {/* Matches IconButton's own padding (size="small" -> 5px) so this
                                                    icon's box is the same height as the delete IconButton's, keeping
                                                    both vertically centered on the same line within the row. */}
                                                <Box sx={{ display: 'inline-flex', p: '5px' }}>
                                                    <ErrorOutlineIcon fontSize="small" color="warning" />
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                        {canDelete && (
                                            <Tooltip title={t("btn:delete")}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleDeleteRequest(e, user)}
                                                    variant="noBorder"
                                                >
                                                    <DeleteOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <ConfirmDialog
                open={!!deleteTargets}
                title={t("title:delete")}
                dialogContent={[
                    deleteTargets
                        ? deleteTargets.length === 1
                            ? t("confirm:delete", deleteTargets[0].email ?? deleteTargets[0].uid)
                            : t("confirm:purge", deleteTargets.length)
                        : '',
                ]}
                onOpenChanged={(open) => { if (!open) setDeleteTargets(null); }}
                onValidate={handleDelete}
            />
        </Stack>
    );
}, [buildLoadingState("users", [undefined])]);

const Users = () => {
    const queryContext = useQueryContext();
    const { data: users } = useReactQuery(queryContext.useFetchManagedUsers);
    return <UsersTable users={users} />;
};

export default Users;
