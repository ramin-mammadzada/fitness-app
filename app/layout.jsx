import "./globals.css";
import Navbar from "@/Components/Navbar";
import Sidebar from "@/Components/Sidebar";

export const metadata = {
  title: "Gym Dashboard",
  description: "Səliqəli idarə paneli",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
