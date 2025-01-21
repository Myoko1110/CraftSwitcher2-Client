import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerBackupCreate } from '../sections/server-backup-create';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerBackupCreate />
    </>
  );
}
