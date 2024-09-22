import type {Breakpoint} from "@mui/material/styles";

import React from "react";
import {Link as RouterLink} from "react-router-dom";

import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import {useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import {DashboardContent} from "src/layouts/dashboard";

import ServerConsole from "../server-console";

// ----------------------------------------------------------------------

export function ServerConsoleView() {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const isMobileSize = useMediaQuery(theme.breakpoints.down(layoutQuery));

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="column" sx={{flexGrow: 1}}>

        <Link
          key="1"
          color="inherit"
          fontSize="small"
          component={RouterLink}
          to="/server"
          sx={{width: "fit-content"}}
        >
          サーバー
        </Link>
        <Typography variant="h4" mb={5}>Lobby</Typography>


        <Card sx={{
          width: '100%',
          flexGrow: 1,
          display: "flex",
          [theme.breakpoints.down(layoutQuery)]: {flexDirection: "column"}
        }}>
          <Tabs
            orientation={isMobileSize ? "horizontal" : "vertical"}
            value="console"
            sx={{pr: .5, borderColor: 'divider'}}

          >
            <Tab value="summary" label="概要"/>
            <Tab value="console" label="コンソール"/>
            <Tab value="file" label="ファイル"/>
          </Tabs>
          <ServerConsole />
        </Card>
      </Stack>
    </DashboardContent>
  );
}