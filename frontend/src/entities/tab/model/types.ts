export interface TabGroup {
  id: string;
  name: string;
  tabIds: number[];
  color: string;
}

export interface TabData {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
}
