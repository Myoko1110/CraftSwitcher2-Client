import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerFileEditView } from 'src/sections/server-file-edit/';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerFileEditView />
    </>
  );
}
