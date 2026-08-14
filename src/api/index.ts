import { createApi } from './request';

export interface HolidayData {
  name: string;
  date: string;
  isOffDay: boolean;
}

export interface HolidayApiResponse {
  year: number;
  days: HolidayData[];
}

export interface OilPriceCityData {
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

export interface OilPriceApiResponse {
  data: OilPriceCityData[];
  total: number;
  date: string;
}

export const fetchHolidayApi = createApi<HolidayApiResponse>({
  method: 'POST',
  url: '/holidays/year',
});

export const fetchOilPriceApi = createApi<OilPriceApiResponse>({
  method: 'POST',
  url: '/oil-prices',
});
