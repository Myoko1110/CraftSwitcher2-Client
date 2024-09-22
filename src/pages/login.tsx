import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { LoginView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Login - ${CONFIG.appName}`}</title>
      </Helmet>

      <LoginView />
    </>
  );
}
