import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerBackupRestore } from '../sections/server-backup-restore';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerBackupRestore />
    </>
  );
}
