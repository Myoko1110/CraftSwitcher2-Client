import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: '概要',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'サーバー',
    path: '/server',
    icon: icon('ic-server'),
  },
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //
  // },
  {
    title: 'Bot',
    path: '/bot',
    icon: icon('ic-robot'),
  },
];
