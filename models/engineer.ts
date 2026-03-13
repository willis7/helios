export enum StrategyTemplate {
  FOLLOW_SUN = 'FOLLOW_SUN',
  TWELVE_HOUR = 'TWELVE_HOUR',
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM',
}

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

export interface BioRhythm {
  sleepStart: number; // hour 0-23
  sleepEnd: number; // hour 0-23
  businessStart: number; // hour 0-23
  businessEnd: number; // hour 0-23
}

export interface ShiftAssignment {
  engineerId: string;
  startHour: number; // UTC
  endHour: number; // UTC
  strategy: StrategyTemplate;
}

export interface RiskWindow {
  startHour: number;
  endHour: number;
  probability: number; // 0.0-1.0
  label: string;
}

export interface Scenario {
  id: string;
  name: string;
  strategy: StrategyTemplate;
  shiftAssignments: ShiftAssignment[];
  riskWindows: RiskWindow[];
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
  bioRhythm?: BioRhythm;
}
