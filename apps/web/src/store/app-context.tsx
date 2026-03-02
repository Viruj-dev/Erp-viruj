"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ProviderType =
  | "hospital"
  | "doctor"
  | "clinic"
  | "pathology"
  | "radiology"
  | "";

interface AppState {
  providerType: ProviderType;
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  currentPage: string;
  isSignUp: boolean;
}

interface AppContextType {
  state: AppState;
  setProviderType: (type: ProviderType) => void;
  setLoggedIn: (val: boolean) => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setCurrentPage: (page: string) => void;
  setIsSignUp: (val: boolean) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    providerType: "",
    isLoggedIn: false,
    userName: "",
    userEmail: "",
    currentPage: "dashboard",
    isSignUp: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const providerType =
      (localStorage.getItem("providerType") as ProviderType) || "";
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userName = localStorage.getItem("userName") || "";
    const userEmail = localStorage.getItem("userEmail") || "";

    setState((prev) => ({
      ...prev,
      providerType,
      isLoggedIn,
      userName,
      userEmail,
    }));
  }, []);

  const setProviderType = (type: ProviderType) => {
    setState((s) => ({ ...s, providerType: type }));
    localStorage.setItem("providerType", type);
  };

  const setLoggedIn = (val: boolean) => {
    setState((s) => ({ ...s, isLoggedIn: val }));
    localStorage.setItem("isLoggedIn", String(val));
  };

  const setUserName = (name: string) => {
    setState((s) => ({ ...s, userName: name }));
    localStorage.setItem("userName", name);
  };

  const setUserEmail = (email: string) => {
    setState((s) => ({ ...s, userEmail: email }));
    localStorage.setItem("userEmail", email);
  };

  const setCurrentPage = (page: string) =>
    setState((s) => ({ ...s, currentPage: page }));
  const setIsSignUp = (val: boolean) =>
    setState((s) => ({ ...s, isSignUp: val }));

  const logout = () => {
    localStorage.clear();
    setState({
      providerType: "",
      isLoggedIn: false,
      userName: "",
      userEmail: "",
      currentPage: "dashboard",
      isSignUp: false,
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setProviderType,
        setLoggedIn,
        setUserName,
        setUserEmail,
        setCurrentPage,
        setIsSignUp,
        logout,
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
