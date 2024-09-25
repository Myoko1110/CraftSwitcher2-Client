import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerCreateView } from '../sections/server-create/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerCreateView />
    </>
  );
}
