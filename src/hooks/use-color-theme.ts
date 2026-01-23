"use client";

import { useEffect, useState } from "react";
import { themes, getThemeByName } from "@/lib/themes";
import { getThemeCookie, setThemeCookie } from "@/lib/cookies";

export function useColorTheme() {
  const [colorTheme, setColorTheme] = useState("default");

  useEffect(() => {
    const savedTheme = getThemeCookie() || "default";
    setColorTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName: string) => {
    const theme = getThemeByName(themeName);
    if (!theme) return;

    document.documentElement.setAttribute("data-theme", themeName);
    
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const vars = isDark ? theme.cssVars.dark : theme.cssVars.light;

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  const changeTheme = (themeName: string) => {
    setColorTheme(themeName);
    setThemeCookie(themeName);
    applyTheme(themeName);
  };

  return { colorTheme, changeTheme, themes };
}
