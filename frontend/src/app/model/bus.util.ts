export interface BusView {
  _id: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  rating: number[];
  reschedulable: number;
  liveTracking: number;
  totalSeats: number;
  filledseats: number[];
  duration: number;
  bustypename: string;
  seatprice: number;
  avgrating: number;
  reviews: number;
  departurehours: number;
  arrivalhours: number;
  seatsavailable: number;
}

export function busTypeLabel(busType: string): string {
  const type = (busType || '').toLowerCase();
  const airconditioned = type.includes('a/c') || /\bac\b/.test(type);
  const sleeper = type.includes('sleeper');

  if (sleeper) {
    return airconditioned ? 'A/C Sleeper' : 'Sleeper';
  }
  return airconditioned ? 'A/C Seater' : 'Non A/C Seater';
}

export function isAC(busType: string): boolean {
  const type = (busType || '').toLowerCase();
  return type.includes('a/c') || /\bac\b/.test(type);
}

export function isSleeper(busType: string): boolean {
  return (busType || '').toLowerCase().includes('sleeper');
}

export function fareForBus(busType: string, durationHours: number): number {
  const type = (busType || '').toLowerCase();
  const airconditioned = type.includes('a/c') || /\bac\b/.test(type);
  const sleeper = type.includes('sleeper');
  const hourlyrate = sleeper ? (airconditioned ? 180 : 130) : airconditioned ? 150 : 90;

  return Math.max(100, Math.round((hourlyrate * Math.max(durationHours || 1, 1)) / 2));
}

export function toHours(value: string): number {
  const [hours, minutes] = String(value || '0').split(':');
  return (Number(hours) || 0) + (Number(minutes) || 0) / 60;
}

export function clockFormat(value: number): string {
  const hours = Math.floor(value) % 24;
  const minutes = Math.round((value - Math.floor(value)) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function averageRating(rating: number[]): number {
  if (!rating?.length) {
    return 0;
  }
  return Math.round((rating.reduce((total, value) => total + value, 0) / rating.length) * 10) / 10;
}

export function departureSlot(hours: number): string {
  if (hours < 6) {
    return 'before6';
  }
  if (hours < 12) {
    return '6-12';
  }
  if (hours < 18) {
    return '12-18';
  }
  return 'after18';
}

export function enrichBus(bus: any, route: any, filledseats: number[] = []): BusView {
  const duration = Number(route?.duration) || 0;
  const departurehours = toHours(bus?.departureTime);
  return {
    _id: String(bus?._id ?? ''),
    operatorName: bus?.operatorName ?? '',
    busType: bus?.busType ?? '',
    departureTime: bus?.departureTime ?? '',
    rating: Array.isArray(bus?.rating) ? bus.rating : [],
    reschedulable: bus?.reschedulable ?? 0,
    liveTracking: bus?.liveTracking ?? 0,
    totalSeats: bus?.totalSeats || 40,
    filledseats: Array.isArray(filledseats) ? filledseats : [],
    duration,
    bustypename: busTypeLabel(bus?.busType ?? ''),
    seatprice: fareForBus(bus?.busType ?? '', duration),
    avgrating: averageRating(bus?.rating),
    reviews: (bus?.rating ?? []).length,
    departurehours,
    arrivalhours: (departurehours + duration) % 24,
    seatsavailable: Math.max(0, (bus?.totalSeats || 40) - (filledseats?.length ?? 0)),
  };
}
