import type { SVGProps } from 'react';

export type NombreIcono =
  | 'bell'
  | 'logout'
  | 'edit'
  | 'camera'
  | 'target'
  | 'phone'
  | 'mail'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'user'
  | 'arrow'
  | 'menu'
  | 'close'
  | 'check'
  | 'cart'
  | 'truck'
  | 'store'
  | 'table'
  | 'card'
  | 'gift'
  | 'flame'
  | 'leaf'
  | 'clock'
  | 'star'
  | 'percent'
  | 'mobile'
  | 'cutlery'
  | 'pin'
  | 'search'
  | 'heart'
  | 'grid'
  | 'chicken'
  | 'grill'
  | 'rice'
  | 'fries'
  | 'drink'
  | 'bowl'
  | 'home'
  | 'tag'
  | 'sort'
  | 'chevron'
  | 'users'
  | 'pumpkin'
  | 'trash'
  | 'receipt'
  | 'cash'
  | 'shield';

const trazados: Record<NombreIcono, string[]> = {
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  logout: ['M10 3H4v18h6', 'M8 12h14', 'm16 6 6 6-6 6'],
  edit: ['m16 3 5 5-12 12-6 1 1-6Z', 'm14 5 5 5'],
  camera: ['M3 6h4l2-3h6l2 3h4v15H3Z', 'M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
  target: [
    'M12 2a10 10 0 1 0 10 10',
    'M12 6a6 6 0 1 0 6 6',
    'M12 10a2 2 0 1 0 2 2',
    'm12 12 9-9',
    'M17 2v5h5',
  ],
  trash: ['M3 6h18', 'M8 6V3h8v3', 'M5 6l1 16h12l1-16', 'M10 10v8', 'M14 10v8'],
  receipt: ['M5 2h14v20l-3-2-4 2-4-2-3 2Z', 'M8 7h8', 'M8 11h8', 'M8 15h5'],
  cash: [
    'M2 5h20v14H2Z',
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    'M5 9v6',
    'M19 9v6',
  ],
  shield: ['M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6Z', 'm8 12 3 3 5-6'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  pumpkin: [
    'M12 5c-8-6-15 17-2 17h4c13 0 6-23-2-17Z',
    'M12 5V1l3 1',
    'm6 11 3-2 1 3Z',
    'm18 11-3-2-1 3Z',
    'm7 16 3 2 2-1 2 1 3-2',
  ],
  chevron: ['m6 9 6 6 6-6'],
  search: ['M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z', 'm15 15 6 6'],
  heart: ['M12 21 3 12C-2 5 7 0 12 6c5-6 14-1 9 6Z'],
  grid: ['M3 3h7v7H3Z', 'M14 3h7v7h-7Z', 'M3 14h7v7H3Z', 'M14 14h7v7h-7Z'],
  chicken: [
    'M5 17c-2-2-1-7 2-9 3-2 7-1 9 1 2 2 3 5 1 7',
    'M7 12c-2 0-3 3-1 5 2 2 5 1 6-1',
    'M14 12c-2 1-2 4 0 5 2 1 4 0 5-2l2-1',
    'M21 14c2 1 3-2 1-3-1-1-3 0-2 2',
    'M2 19c4 3 16 3 20 0',
    'M9 9c2-1 4 0 5 1',
  ],
  grill: [
    'M3 9h18c0 6-18 6-18 0Z',
    'M5 18h14',
    'm8 14-3 8',
    'm16 14 3 8',
    'M9 2c-2 2 2 3 0 5',
    'M15 2c-2 2 2 3 0 5',
  ],
  rice: [
    'M3 11c0 6 4 10 9 10s9-4 9-10H3Z',
    'M6 11c0-4 3-7 6-7s6 3 6 7',
    'M4 11h16',
  ],
  fries: [
    'M5 10l2 11h10l2-11H5Z',
    'M8 10V3h2v7',
    'M11 10V5h2v5',
    'M14 10V2h2v8',
  ],
  drink: [
    'M6 3h12l-2 18H8L6 3Z',
    'M6 7h12',
    'M15 3l-1-2h-4',
  ],
  bowl: [
    'M3 11c0 6 4 10 9 10s9-4 9-10H3Z',
    'M12 4v4',
    'M8 5v3',
    'M16 5v3',
  ],
  home: ['M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3Z'],
  tag: [
    'M20.6 13.4 12 4.8A2 2 0 0 0 10.6 4.2H4a2 2 0 0 0-2 2v6.6a2 2 0 0 0 .6 1.4l8.6 8.6a2 2 0 0 0 2.8 0l6.6-6.6a2 2 0 0 0 0-2.8Z',
    'M7 7h.01',
  ],
  sort: ['M3 6h18M6 12h12M10 18h4'],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z',
  ],
  mail: [
    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z',
    'm22 6-10 7L2 6',
  ],
  lock: [
    'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z',
    'M7 11V7a5 5 0 0 1 10 0v4',
  ],
  eye: [
    'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z',
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  ],
  'eye-off': [
    'M9.88 9.88a3 3 0 1 0 4.24 4.24',
    'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68',
    'M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61',
    'm2 2 20 20',
  ],
  user: [
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  ],
  arrow: ['m9 18 6-6-6-6'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['m18 6-12 12', 'm6 6 12 12'],
  check: ['m5 13 4 4L19 7'],
  cart: [
    'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6',
    'M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    'M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  ],
  truck: [
    'M1 3h15v13H1z',
    'M16 8h4l3 3v5h-7V8z',
    'M5.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    'M18.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  ],
  store: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  table: ['M4 6h16v12H4z', 'M4 10h16', 'M10 6v12'],
  card: ['M1 4h22v16H1z', 'M1 10h22'],
  gift: [
    'M20 12v10H4V12',
    'M2 7h20v5H2z',
    'M12 22V7',
    'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z',
    'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  ],
  flame: [
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z',
  ],
  leaf: ['M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3c0 9-4 16-10 17z', 'M4 21l8-8'],
  clock: ['M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z', 'M12 6v6l4 2'],
  star: [
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  ],
  percent: [
    'M19 5L5 19',
    'M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    'M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  ],
  mobile: ['M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', 'M11 18h2'],
  cutlery: ['M18 2v20', 'M21 2v6a3 3 0 0 1-3 3h0', 'M3 2v7a3 3 0 0 0 3 3h0v10', 'M6 2v7', 'M9 2v7'],
  pin: ['M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
};

export function Icono({
  name,
  className,
  ...propiedades
}: {
  name: NombreIcono;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  const lineas = trazados[name] || [];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `icon icon-${name} ${className}` : `icon icon-${name}`}
      aria-hidden="true"
      {...propiedades}
    >
      {lineas.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}
