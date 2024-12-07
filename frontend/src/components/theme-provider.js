"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({ children, defaultTheme = "system", attribute = "class", ...props }) {
  return (
    <NextThemesProvider defaultTheme={defaultTheme} attribute={attribute} {...props}>
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = useNextTheme; // Directly using next-themes' useTheme hook
