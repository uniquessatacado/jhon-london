import { createContext, useContext } from "react";
import { ThemeProviderState } from "../contexts/ThemeContext";

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
