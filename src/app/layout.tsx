import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading Wishlist",
  description: "Track books you want to read",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
