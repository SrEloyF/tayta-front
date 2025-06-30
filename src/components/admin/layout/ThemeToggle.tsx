"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Efecto para cargar el tema guardado
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  // Efecto para aplicar el tema
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches 
        ? "dark" 
        : "light";
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Manejar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(systemTheme);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  if (!mounted) {
    return (
      <div className={cn("h-8 w-8 flex items-center justify-center", className)}>
        <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <div className="relative">
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          id="theme-menu"
          aria-expanded="false"
          aria-haspopup="true"
          onClick={() => {
            const newTheme: Theme = 
              theme === "light" ? "dark" : 
              theme === "dark" ? "system" : "light";
            setTheme(newTheme);
          }}
        >
          <span className="sr-only">Cambiar tema</span>
          {theme === "light" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : theme === "dark" ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Monitor className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
