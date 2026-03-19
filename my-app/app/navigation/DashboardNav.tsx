"use client";

// Importering av React-hooks og komponenter som er nødvendige for siden
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./DashboardNav.module.css";

/*
 * Typedefinisjon for navigasjonselement.
 * Hver navigasjonsknapp har et ikon (emoji), etikettekst, og en målsti (path).
 */

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

/*
 * Typedefinisjon for props som sendes til DashboardNav-komponenten.
 *
 * @property darkMode - Boolean som indikerer om mørk tema er aktivert
 * @property onDarkModeChange - Callback-funksjon som kalles når bruker bytter tema
 */

interface DashboardNavProps {
  darkMode: boolean;
  onDarkModeChange?: (isDark: boolean) => void;
}

/*
 * Konstant array med navigasjonselementer.
 * Definerer alle hovednavigasjonsmuligheter som er tilgjengelige i navbar.
 * Hver item inneholder emoji-ikon, displaynavn, og rute-sti.
 */

const navItems: NavItem[] = [
  { icon: "👤", label: "BRUKER", path: "/profil" },
  { icon: "🎛", label: "KONTROLLPANEL", path: "/" },
  { icon: "🔍", label: "SØK I PRODUKTER", path: "/produkt" },
];

/*
 * DashboardNav-komponent - Hovednavigasjonbar for dashbordet.
 *
 * Komponentens ansvar:
 * - Viser navigasjonsalternativer på venstre side
 * - Viser temaveksler og logut-knapper på høyre side
 * - Håndterer rutingsnavigasjon til forskjellige sider
 * - Håndterer temabyttinger via callback til parent-komponent
 */

export function DashboardNav({
  darkMode,
  onDarkModeChange,
}: DashboardNavProps) {
  /*
   * Next.js useRouter hook for programmatisk navigasjon.
   * Brukes til å navigere brukeren når de klikker på navigasjonselementer.
   */

  const router = useRouter();

  /*
   * Håndterer logut-klikk.
   * For øyeblikket logger den kun til konsollen.
   * Kan utvides senere med faktisk logut-logikk (f.eks. sletting av token, API-kall, osv.).
   */

  const handleLogout = () => console.log("Logout clicked");

  /*
   * Returnerer JSX for hele navigasjonsbaren.
   *
   * Strukturen:
   * 1. Nav-kontainer med dynamisk tema-klasse (mørk eller svart bakgrunn)
   * 2. Venstre seksjon: Navigasjonsknapper for side-bytte
   * 3. Høyre seksjon: Temaveksler og logut-knapp
   */

  return (
    <nav
      /*
       * Kombinerer base navContainer-klasse med dynamisk tema-bakgrunn.
       * Bruker mørk tema hvis darkMode er true, ellers svart tema.
       */

      className={`${styles.navContainer} ${darkMode ? styles.bgDark : styles.bgBlack}`}>

      <div className={styles.leftSection}>
        {/*
         * Kartlegger gjennom alle navigasjonselementer og oppretter
         * en knapp for hver. Hver knapp navigerer til angitt sti
         * når den klikkes.
         */}

        {navItems.map((item) => (
          <button
            key={item.label}
            /*
             * Klikk-handler som bruker router.push() for å navigere
             * til knappens tilhørende sti.
             */

            onClick={() => router.push(item.path)}
            className={styles.navButton}>
            {/*
             * Ikon-span - viser emoji-ikonen for navigasjonselementet.
             */}

            <span className={styles.icon}>{item.icon}</span>

            {/*
             * Etikett-span - viser tekstlabel for navigasjonselementet.
             */}
             
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.rightSection}>
        {/*
         * TEMAVEKSLER-KNAPP
         *
         * Tillater brukeren å bytte mellom mørk og lyst tema.
         * Kaller onDarkModeChange callback med motsatt av gjeldende darkMode.
         */}

        <button
          onClick={() => onDarkModeChange?.(!darkMode)}
          className={styles.secondaryButton}
          title="Bytt tema"
        >
          {/*
           * Ikon som endres basert på gjeldende tema.
           * Sol (☀️) når mørk tema er aktivert, måne (🌙) når lyst tema.
           */}

          <span className={styles.smallIcon}>{darkMode ? "☀️" : "🌙"}</span>

          {/*
           * Tekst som endres basert på gjeldende tema.
           * Viser hvilken tema som skal aktiveres dersom knappen klikkes.
           */}

          <span>{darkMode ? "Normalt tema" : "Dempet tema"}</span>
        </button>

        {/*
         * LOGUT-KNAPP
         *
         * Tillater brukeren å logge ut av applikasjonen.
         * Kaller handleLogout-funksjonen når den klikkes.
         */}

        <button
          onClick={handleLogout}
          className={styles.secondaryButton}
          title="Logg ut"
        >
          {/*
           * Ikon for logut - bruker dørikon (🚪) for å visuelt indikere logut.
           */}

          <span className={styles.smallIcon}>🚪</span>

          {/*
           * Tekst-etikett for logut-knapp.
           */}

          <span>Logg ut</span>
        </button>
      </div>
    </nav>
  );
}
