import type Server from 'src/api/server';
import type Backup from 'src/api/backup';

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from '@mui/material/Table';
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import {RouterLink} from "src/routes/components";

import { Scrollbar } from 'src/components/scrollbar';

import { useTable } from '../utils';
import { BackupTableRow } from '../backup-table-row';
import { BackupTableHead } from '../backup-table-head';
import { TableLoading } from '../../server/table-loading';

export function ServerBackupView() {
  const { server } = useOutletContext<{ server: Server | null }>();

  const table = useTable();
  const [backups, setBackups] = useState<Backup[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [unableToLoad, setUnableToLoad] = useState(false);

  useEffect(() => {
    if (!server) return;

    (async () => {
      try {
        const b = await server.getBackups();
        setBackups(b.reverse());
        setIsLoading(false);
      } catch (e) {
        console.error(e);
        setUnableToLoad(true);
      }
    })();
  }, [server]);

  return (
    <Box sx={{ height: '100%', display: "flex", flexDirection: "column" }}>
      <Stack sx={{
        flexGrow: 1,
        height: '100%',
        position: 'relative',
      }}>
        <Scrollbar style={{ height: 0 }}>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }} stickyHeader>
              <BackupTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={backups.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, backups)}
              />
              <TableBody>
                {backups.map((b) => (
                  <BackupTableRow
                    key={b.id}
                    backup={b}
                    selected={table.selected.includes(b)}
                    onSelectRow={() => table.onSelectRow(b)}
                    backups={backups}
                    setBackups={setBackups}
                    server={server}
                  />
                ))}
                {isLoading && <TableLoading unableToLoad={unableToLoad} />}
              </TableBody>
            </Table>
          </TableContainer>

        </Scrollbar>
      </Stack>
      <Card
        sx={{
          width: '100%',
          borderRadius: 0,
          display: 'flex',
          justifyContent: "end",
          p: 2,
          gap: 1,
        }}
      >
        <Button
          color="inherit"
          variant="contained"
          component={RouterLink}
          href="./create"
        >
          バックアップ開始
        </Button>
      </Card>
    </Box>

  );
}
