import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
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
      className={`${manrope.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
