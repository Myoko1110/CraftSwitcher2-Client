import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerConsoleView } from 'src/sections/server-console/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerConsoleView />
    </>
  );
}
