"use client";

import React, { useState } from "react";
import styles from "../styles/page.module.css";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    console.log("Genererer bilde med prompt:", prompt);
    // Logikk for bildegenerering skal ligge her
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoGroup}>
          <div className={styles.avatar}>E</div>
          <span>ADMIN BRUKER</span>
        </div>
        <nav className={styles.topNav}>
          <div className={styles.navItem}>🏠 KONTROLLPANEL</div>
          <div className={styles.navItem}>🔍 SØK I PRODUKTER</div>
        </nav>
      </header>

      {/* Main - Grid */}
      <main className={styles.mainGrid}>
        {/* Venstre Kolonne */}
        <div className={styles.leftCol}>
          <div className={`${styles.box} ${styles.imagePlaceholder}`}>
            BILDE DU HAR VALGT
          </div>

          <div className={styles.inputArea}>
            <div className={`${styles.box} ${styles.promptBox}`}>
              <input
                type="text"
                placeholder="PROMT"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <button className={styles.generateBtn} onClick={handleGenerate}>
              GENERER BILDE
            </button>
          </div>
        </div>

        {/* Høyre Kolonne */}
        <div className={styles.rightCol}>
          <div className={`${styles.box} ${styles.scoreBoard}`}>
            <div className={styles.scoreItem}>
              <span className={styles.label}>GEMINI</span>
              <span className={styles.value}>0.43</span>
            </div>
            <div className={styles.scoreItem}>
              <span className={styles.label}>GPT</span>
              <span className={styles.value}>0.85</span>
            </div>
            <div className={styles.scoreItem}>
              <span className={styles.label}>GROK</span>
              <span className={styles.value}>0.68</span>
            </div>
          </div>

          <div className={`${styles.box} ${styles.resultBox}`}>RESULTAT</div>
        </div>
      </main>

      {/* Setting/Logut (Nederst til venstre) */}
      <footer className={styles.footerActions}>
        <div className={styles.actionItem}>⚙️ INNSTILLINGER</div>
        <div className={styles.actionItem}>🚪 LOGG UT</div>
      </footer>
    </div>
  );
};

export default Dashboard;
