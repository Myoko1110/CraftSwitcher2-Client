import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import User from 'src/api/user';
import { APIError } from 'src/enums/api-error';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { UserCreateDialog } from '../user-create-dialog';
import { TableLoading } from '../../server/table-loading';

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unableToLoad, setUnableToLoad] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const reloadUsers = useCallback(async () => {
    try {
      const result = await User.all();
      setIsLoading(false);
      setUsers(result);
    } catch (e) {
      setUnableToLoad(true);
      toast.error(`ディレクトリの取得に失敗しました: ${APIError.createToastMessage(e)}`);
    }
  }, []);

  useEffect(() => {
    reloadUsers();
  }, [reloadUsers]);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          ユーザー
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateDialogOpen(true)}
        >
          追加
        </Button>
      </Box>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, users)}
                headLabel={[
                  { id: 'name', label: '名前' },
                  { id: 'lastLogin', label: '最終ログイン日時' },
                  { id: 'lastAddress', label: '最終ログインIPアドレス' },
                  { id: 'permission', label: '権限' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {users.map((u) => (
                  <UserTableRow
                    key={u.id}
                    user={u}
                    selected={table.selected.includes(u)}
                    onSelectRow={() => table.onSelectRow(u)}
                    reloadUsers={reloadUsers}
                  />
                ))}
                {isLoading && <TableLoading unableToLoad={unableToLoad} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>
      <UserCreateDialog
        open={createDialogOpen}
        setOpen={setCreateDialogOpen}
        reloadUsers={reloadUsers}
      />
    </DashboardContent>
  );
}

function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<User[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: User[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: User) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  const resetSelected = useCallback(() => {
    setSelected([]);
  }, []);

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
    resetSelected,
    setSelected,
  };
}
