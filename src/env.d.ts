/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegistrationError?: (error: Error) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'mime-db' {
  interface MimeEntry {
    source?: string;
    charset?: string;
    compressible?: boolean;
    extensions?: string[];
  }
  const db: Record<string, MimeEntry>;
  export default db;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
}

interface ApiRequestOptions {
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface HolidayData {
  name: string;
  date: string;
  isOffDay: boolean;
}

interface HolidayApiResponse {
  year: number;
  days: HolidayData[];
}

interface Holiday {
  name: string;
  date: string;
  isWorkday?: boolean;
}

interface OilPriceCityData {
  dim_id: string;
  dim_date: string;
  city_name: string;
  first_letter: string;
  v0: number;
  v92: number;
  v95: number;
  v89: number;
  zde0: number;
  zde92: number;
  zde95: number;
  zde89: number;
  qe0: number;
  qe92: number;
  qe95: number;
  qe89: number;
  highlight?: boolean;
}

interface OilPriceApiResponse {
  data: OilPriceCityData[];
  total: number;
  date: string;
}

interface CalendarCell {
  day: number;
  lunar: string;
  solarTerm: string;
  holidayName: string;
  showHolidayName: boolean;
  isHoliday: boolean;
  isWeekend: boolean;
  isWorkday: boolean;
  isToday: boolean;
  isSelected: boolean;
}

interface TorrentInfo {
  fileName: string;
  magnet: string;
}

interface PageMetaConfig {
  title?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
  hidden?: boolean;
}

interface DirMetaConfig {
  title?: string;
  icon?: string;
  isActive?: boolean;
  hidden?: boolean;
}

interface NavMainItem {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  items?: NavMainSubItem[];
}

interface NavMainSubItem {
  title: string;
  url: string;
  icon?: string;
}
