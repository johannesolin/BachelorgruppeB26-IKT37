"use client";

// Importering av React-hooks og komponenter som er nødvendige for siden
import React, { useEffect, useState, FormEvent } from "react";
import { DashboardNav } from "../navigation/DashboardNav";
import { getStoredTheme, saveTheme } from "../../lib/theme";
import styles from "./page.module.css";
import { Product } from "@/db/types";

/*
 * Typedefinisjon for Product-objektet.
 * Inneholder felter for identifisering, beskrivelse og bilde-referanser.
 * Bruker [key: string]: any for å støtte dynamiske felter fra API-et.
 */



/*
 * Hovedkomponent for produktsiden.
 * Håndterer søk mot produkt-API, visning av produktinformasjon og bildehåndtering,
 * samt kontroll over mørkt/lyst tema for konsistent brukeropplevelse.
 */

export default function ProduktSide() {
  /*
   * State for mørkt/lyst tema
   */
  const [darkModeState, setDarkModeState] = useState<boolean>(true);

  /*
   * State for søk og input-håndtering
   */
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * State for produktdata og API-respons
   */
  const [product, setProduct] = useState<Product | null>(null);
  const [bestHref, setBestHref] = useState<string>("");

  /*
   * State for lastetilstander og feilmeldinger
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  /*
   * Laster lagret tema fra localStorage ved komponentens montering.
   */

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setDarkModeState(storedTheme === "dark");
  }, []);

  /*
   * Setter mørkt/lyst tema og lagrer valget i localStorage.
   */

  const setDarkMode = (isDark: boolean) => {
    setDarkModeState(isDark);
    saveTheme(isDark ? "dark" : "light");
  };

  const darkMode = darkModeState;

  /*
   * Håndterer søk etter produkt basert på brukerens input.
   * Validerer input, sender forespørsel til search-product API,
   * og håndterer responsen inkludert feilmeldinger og "ikke funnet"-tilstander.
   */

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Valider at søkefeltet ikke er tomt
    if (!searchQuery.trim()) {
      setError("Vennligst skriv inn et produktnummer eller produkt ID");
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);
    setProduct(null);
    setBestHref("");

    try {
      const response = await fetch("/api/products/by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: searchQuery.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Produkt ikke funnet");
        setNotFound(true);
        return;
      }

      // Oppdater state med funnet produkt og tilhørende bilde-URL
      setProduct(data);
      const firstImage = data.images?.[0]?.href;
      if (firstImage) {
        setBestHref(firstImage);
      }
    } catch (err) {
      setError("Feil ved kommunikasjon med server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Returnerer JSX for produktsiden.
   * DashboardNav mottar darkMode og setDarkMode for temakontroll.
   * Siden er delt inn i en søkeseksjon og en detaljseksjon som vises ved treff.
   */

  return (
    <>
      <DashboardNav darkMode={darkMode} onDarkModeChange={setDarkMode} />
      <main
        className={`${styles.main} ${
          darkMode ? styles.darkMode : styles.lightMode
        }`}
      >
        <div className={styles.containerWrapper}>
          {/* Seksjon for produktsøk */}
          <section
            className={`${styles.section} ${styles.searchSection} ${
              darkMode ? styles.darkMode : styles.lightMode
            }`}
          >
            <h2
              className={`${styles.sectionTitle} ${
                darkMode ? styles.darkMode : styles.lightMode
              }`}
            >
              SØK ETTER PRODUKT
            </h2>

            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Produktnummer Her..."
                className={`${styles.searchInput} ${
                  darkMode ? styles.darkMode : styles.lightMode
                }`}
              />
              <button
                type="submit"
                disabled={loading}
                className={`${styles.searchButton} ${
                  darkMode ? styles.darkMode : styles.lightMode
                }`}
              >
                {loading ? "Søker..." : "Søk"}
              </button>
            </form>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </section>

          {/* Seksjon for visning av produktdetaljer - vises kun når et produkt er funnet */}
          {product && (
            <section
              className={`${styles.section} ${styles.productDetailsSection} ${
                darkMode ? styles.darkMode : styles.lightMode
              }`}
            >
              <h2
                className={`${styles.productDetailsTitle} ${
                  darkMode ? styles.darkMode : styles.lightMode
                }`}
              >
                PRODUKTDETALJER
              </h2>

              <div className={styles.productGrid}>
                {/* Venstre kolonne: Produktinformasjon */}
                <div className={styles.productInfoColumn}>
                  <div className={styles.infoField}>
                    <h3 className={styles.infoLabel}>PRODUCTID</h3>
                    <p className={styles.infoValue}>
                      {product.productId || product.productId}
                    </p>
                  </div>
                  <div className={styles.infoField}>
                    <h3 className={styles.infoLabel}>NAME</h3>
                    <p className={styles.infoValue}>
                      {product.name || product.name}
                    </p>
                  </div>
                  <div className={styles.infoField}>
                    <h3 className={styles.infoLabel}>CATEGORYNAME</h3>
                    <p className={styles.infoValue}>
                      {product.categoryName || "HAGEMØBLER"}
                    </p>
                  </div>
                </div>

                {/* Høyre kolonne: Produktbilde */}
                <div className={styles.imageSection}>
                  <h3 className={styles.imageLabel}>IMAGE</h3>
                  {bestHref ? (
                    <img
                      src={bestHref}
                      alt={product.name || "Produktbilde"}
                      className={`${styles.productImage} ${
                        darkMode ? styles.darkMode : styles.lightMode
                      }`}
                    />
                  ) : (
                    <div className={styles.noImagePlaceholder}>
                      Ingen bilde tilgjengelig i databasen
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Vises når ingen søk er utført eller ingen resultater foreligger */}
          {!product && !loading && (
            <div className={styles.emptyState}>
              Søk etter et produkt for å se detaljer
            </div>
          )}
        </div>
      </main>
    </>
  );
}