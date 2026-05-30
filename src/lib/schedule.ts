export interface VillageSchedule {
  notificationTime?: string;
  Monday?: string[];
  Tuesday?: string[];
  Wednesday?: string[];
  Thursday?: string[];
  Friday?: string[];
  Saturday?: string[];
  Sunday?: string[];
  [key: string]: any;
}

export const defaultVillageSchedule: VillageSchedule = {
  notificationTime: "16:00",
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: []
};
