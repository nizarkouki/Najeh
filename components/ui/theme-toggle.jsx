"use client"
import { Button } from "@/components/ui/button"
import { FaSun, FaMoon } from "react-icons/fa"
import { useTheme } from "next-themes"

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative rounded-full cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
        <FaSun className="absolute h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
        <FaMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
