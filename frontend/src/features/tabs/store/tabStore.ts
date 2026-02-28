import { create } from 'zustand';

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

interface TabState {
  tabs: TabData[];
  groups: TabGroup[];
  blockedDomains: string[];
  
  setTabs: (tabs: TabData[]) => void;
  createGroup: (name: string, tabIds: number[]) => void;
  deleteGroup: (id: string) => void;
  blockDomain: (domain: string) => void;
  unblockDomain: (domain: string) => void;
  isDomainBlocked: (url: string) => boolean;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  groups: [],
  blockedDomains: [],

  setTabs: (tabs) => set({ tabs }),
  
  createGroup: (name, tabIds) => 
    set((state) => ({
      groups: [...state.groups, { 
        id: crypto.randomUUID(), 
        name, 
        tabIds, 
        color: '#' + Math.floor(Math.random()*16777215).toString(16) 
      }]
    })),

  deleteGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter(g => g.id !== id)
    })),

  blockDomain: (domain) =>
    set((state) => ({
      blockedDomains: [...state.blockedDomains, domain]
    })),

  unblockDomain: (domain) =>
    set((state) => ({
      blockedDomains: state.blockedDomains.filter(d => d !== domain)
    })),

  isDomainBlocked: (url) => {
    try {
      const hostname = new URL(url).hostname;
      return get().blockedDomains.some(d => hostname.includes(d));
    } catch {
      return false;
    }
  }
}));
