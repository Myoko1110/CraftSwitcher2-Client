import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerBackupCompare } from "../sections/server-backup-compare";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerBackupCompare />
    </>
  );
}
