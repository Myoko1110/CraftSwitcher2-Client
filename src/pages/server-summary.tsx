import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerSummaryView } from 'src/sections/server-summary/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerSummaryView />
    </>
  );
}
