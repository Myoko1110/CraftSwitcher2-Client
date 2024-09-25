import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { ServerConsoleView } from 'src/sections/server-console/view';

// ----------------------------------------------------------------------

type RouterParams = {
  id: string;
};

export default function Page() {
  const { id } = useParams<RouterParams>();
  console.log(id);
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerConsoleView />
    </>
  );
}
