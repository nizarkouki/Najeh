import { Sora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});


export const metadata = {
  title: "Najeh | Academic Success Companion",
  description: "Najeh is an intelligent academic companion for students and learners. It creates personalized AI-powered study plans, tracks your progress, and optimize your path to success.",
  keywords: ["study planner", "pomodoro", "study schedule", "student productivity", "weekly study plan", "academic planner", "focus timer"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" enableSystem defaultTheme="System">
          {children}
        </ThemeProvider> 
      </body>
    </html>
  );
}
