import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "ระบบบันทึกข้อมูลต้นไม้ จังหวัดสตูล",
  description: "ระบบบันทึกและแสดงข้อมูลการปลูกต้นไม้ในจังหวัดสตูล พร้อมแผนที่แบบ Interactive",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
