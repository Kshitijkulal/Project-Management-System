import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Task Manager",
  description: "Task management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937",
              color: "#f3f4f6",
              border: "1px solid #374151",
              fontSize: "0.875rem",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
