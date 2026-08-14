export type CourierOption = {
  code: string;
  name: string;
  service: string;
  price: number;
  etaLabel: string;
};

export const COURIER_OPTIONS: CourierOption[] = [
  { code: "jnt-ez", name: "J&T Express", service: "EZ", price: 14000, etaLabel: "2-4 hari" },
  { code: "jne-reg", name: "JNE", service: "Reguler", price: 15000, etaLabel: "2-3 hari" },
  { code: "anteraja-reg", name: "AnterAja", service: "Reguler", price: 15000, etaLabel: "2-3 hari" },
  { code: "sicepat-reg", name: "SiCepat", service: "Reguler", price: 16000, etaLabel: "2-3 hari" },
  { code: "sicepat-best", name: "SiCepat", service: "BEST", price: 25000, etaLabel: "1 hari" },
  { code: "jne-yes", name: "JNE", service: "YES", price: 27000, etaLabel: "1 hari" },
];

export function getCourierByCode(code: string): CourierOption | undefined {
  return COURIER_OPTIONS.find((courier) => courier.code === code);
}
