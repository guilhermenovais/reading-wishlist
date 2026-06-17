import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className={inter.className}>
      <body>
        <header className={styles.header}>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              Wishlist
            </Link>
            <Link href="/reading" className={styles.navLink}>
              Reading
            </Link>
            <Link href="/search" className={styles.navLink}>
              Search
            </Link>
          </nav>
        </header>
        <main className={styles.container}>{children}</main>
      </body>
    </html>
  );
}
