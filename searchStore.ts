"use client";

import { create } from "zustand";
import { ProductT } from "@naranjargal/shared-types";
import { SearchResultT } from "../declaration";

interface SearchState {
  searchValue: string;
  searchResult: ProductT[];
  searchSectoredResult: SearchResultT;

  lastSearch: {
    feild: string;
    item: string;
    filters?: any[];
    sort?: any[];
  } | null;

  handleSearchValue: (value: string) => void;
  handleSearchResult: (searchResult: ProductT[]) => void;
  handleSectoredSearchResult: (searchSectoredResult: SearchResultT) => void;

  setLastSearch: (
    lastSearch: {
      feild: string;
      item: string;
      filters?: any[];
      sort?: any[];
    } | null
  ) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchValue: "",
  searchResult: [],
  searchSectoredResult: {
    products: [],
    brands: [],
    maxPrice: 0,
    minPrice: 0,
    options: [],
    stores: [],
  },
  lastSearch: null,

  handleSearchValue: (value: string) => set({ searchValue: value }),
  handleSearchResult: (searchResult: ProductT[]) => set({ searchResult }),
  handleSectoredSearchResult: (searchSectoredResult: SearchResultT) =>
    set({ searchSectoredResult }),

  setLastSearch: (
    lastSearch: {
      feild: string;
      item: string;
      filters?: any[];
      sort?: any[];
    } | null
  ) => set({ lastSearch }),
}));
