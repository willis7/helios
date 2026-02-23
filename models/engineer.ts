export enum EngineerRole {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
  ESCALATION = 'Escalation',
}

export enum EngineerStatus {
  AWAKE = 'awake',
  SLEEPING = 'sleeping',
  DND = 'dnd',
}

export enum Team {
  PLATFORM = 'Platform',
  INFRA = 'Infrastructure',
  PRODUCT = 'Product',
  SRE = 'SRE',
}

export interface EngineerLocation {
  city: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface EngineerShift {
  start: string; // HH:mm format
  end: string; // HH:mm format
  timezone: string;
}

export interface EngineerContact {
  slack: string;
  phone: string;
  email: string;
}

export interface Engineer {
  id: string;
  name: string;
  avatarUrl: string;
  role: EngineerRole;
  team: Team;
  location: EngineerLocation;
  status: EngineerStatus;
  shift: EngineerShift;
  contact: EngineerContact;
}
