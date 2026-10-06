import '@/global.css';

export * from '@/theme';
export type ThemeColor = keyof typeof import('@/theme').Colors.light;
