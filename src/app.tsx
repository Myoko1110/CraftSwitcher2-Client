import 'src/global.css';

import axios from 'axios';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();
  axios.defaults.baseURL = import.meta.env.VITE_FRONTEND_URL;
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  axios.defaults.withCredentials = true;

  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
