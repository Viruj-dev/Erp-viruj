"use client";

import React, { createContext, useContext, useState } from "react";

interface AppState {
  currentPage: string;
}

interface AppContextType {
  state: AppState;
  setCurrentPage: (page: string) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultState: AppState = {
  currentPage: "dashboard",
};

function getInitialState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  return {
    currentPage: localStorage.getItem("currentPage") || "dashboard",
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);

  const setCurrentPage = (page: string) => {
    setState((s) => ({ ...s, currentPage: page }));
    localStorage.setItem("currentPage", page);
  };

  const reset = () => {
    localStorage.removeItem("currentPage");
    setState(defaultState);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setCurrentPage,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
