import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [defaultTheme, setDefaultTheme] = useState<string>("light");

  useEffect(() => {
    // Check if theme preference already exists
    const storedTheme = localStorage.getItem("theme");
    
    if (!storedTheme) {
      // First time load - determine theme based on time
      const currentHour = new Date().getHours();
      // Night time is from 18:00 (6 PM) to 06:00 (6 AM)
      const isNightTime = currentHour >= 18 || currentHour < 6;
      setDefaultTheme(isNightTime ? "dark" : "light");
    }
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
