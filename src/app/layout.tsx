import Provider from "@/components/Provider";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Godspeed GPT",
  description: "GPT powered documentation of Godspeed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <title>Godspeed GPT</title>
      <meta name="description" content="AI documentation of Godspeed" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
