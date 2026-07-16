export interface RuleItem {
  name: string;
  rules: string[];
}

export interface Character {
  name: string;
  race: string;
  nationality: string;
  className: string;
  flawName: string;
  quest: string;
  rules: string[];
}

export type FieldKey =
  | "name"
  | "race"
  | "nationality"
  | "className"
  | "flawName"
  | "quest";

export type LockState = Record<FieldKey, boolean>;
