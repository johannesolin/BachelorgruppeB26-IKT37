"use client";

// Importering av React-hooks og komponenter som er nødvendige for siden
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./DashboardNav.module.css";

/*
 * Typedefinisjon for navigasjonselement.
 */
interface NavItem {
  icon: string;
  label: string;
  path: string; // Sørg for at alle har path for router.push
}

interface DashboardNavProps {
  darkMode: boolean;
  onDarkModeChange?: (isDark: boolean) => void;
}

/*
 * Konstant array med navigasjonselementer flyttet utenfor komponenten (siden den er statisk).
 */
const navItems: NavItem[] = [
  { icon: "👤", label: "BRUKER", path: "/profil" },
  { icon: "🔍", label: "SØK I PRODUKTER", path: "/products" },
  { icon: "📊", label: "KONTROLLPANEL", path: "/" },
];

export function DashboardNav({
  darkMode,
  onDarkModeChange,
}: DashboardNavProps) {
  // ✅ Flyttet useState inn hit!
  const [activeTab, setActiveTab] = useState("dashboard");

  const router = useRouter();

  const handleLogout = () => console.log("Logout clicked");

  return (
    <nav
      className={`${styles.navContainer} ${darkMode ? styles.bgDark : styles.bgBlack}`}
    >
      <div className={styles.leftSection}>
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setActiveTab(item.label.toLowerCase()); // Oppdaterer lokal state
              router.push(item.path); // Navigerer
            }}
            // Du kan nå bruke activeTab til å style knappen som er aktiv:
            className={`${styles.navButton} ${activeTab === item.label.toLowerCase() ? styles.active : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.rightSection}>
        <button
          onClick={() => onDarkModeChange?.(!darkMode)}
          className={styles.secondaryButton}
          title="Bytt tema"
        >
          <span className={styles.smallIcon}>{darkMode ? "☀️" : "🌙"}</span>
          <span>{darkMode ? "Normalt tema" : "Dempet tema"}</span>
        </button>

        <button
          onClick={handleLogout}
          className={styles.secondaryButton}
          title="Logg ut"
        >
          <span className={styles.smallIcon}>🚪</span>
          <span>Logg ut</span>
        </button>
      </div>
    </nav>
  );
}
