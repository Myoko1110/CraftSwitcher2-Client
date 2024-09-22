import {Helmet} from 'react-helmet-async';
import {useParams} from "react-router-dom";

import {CONFIG} from 'src/config-global';

import {ServerFileView} from "src/sections/server-file/view";

// ----------------------------------------------------------------------

type RouterParams = {
  id: string;
};

export default function Page() {
  const {id} = useParams<RouterParams>();
  console.log(id)
  return (
    <>
      <Helmet>
        <title> {`Server - ${CONFIG.appName}`}</title>
      </Helmet>

      <ServerFileView/>
    </>
  );
}
