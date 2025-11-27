import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [defaultTheme, setDefaultTheme] = useState<string>("light");

  useEffect(() => {
    // Check if theme preference already exists
    const storedTheme = localStorage.getItem("theme");

    if (!storedTheme) {
      setDefaultTheme("dark");
    }
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
