import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerFileView } from 'src/sections/server-file/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerFileView />
    </>
  );
}
