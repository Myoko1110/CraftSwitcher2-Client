import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ServerView } from 'src/sections/server/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerView />
    </>
  );
}
