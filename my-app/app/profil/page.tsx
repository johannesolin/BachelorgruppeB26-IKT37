"use client";
import { useEffect, useState } from "react";
import { DashboardNav } from "../navigation/DashboardNav";
import { getStoredTheme, saveTheme } from "../../lib/theme";
import { EnvironmentResultRecord, ProductPlacementResultRecord, SavedPrompt } from "@/db/types";
import { ModelCard } from "@/components/ModelCard";
import { ProfilResultCard } from "@/components/ProfilResultCard";
import { ProfilPromptRow } from "@/components/ProfilPromptRow";
import styles from "./page.module.css";

type ActivePanel = "none" | "results" | "prompts";
type ResultTab = "environment" | "placement";

// Konverterer JSON-stringet produktnavnliste til lesbar tekst
function parseNames(raw: string): string {
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.join(", ") : raw;
    } catch {
        return raw;
    }
}

export default function ProfilPage() {
    const [darkMode, setDarkModeState] = useState(true);
    const [activePanel, setActivePanel] = useState<ActivePanel>("none");
    const [resultTab, setResultTab] = useState<ResultTab>("environment");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [envResults, setEnvResults] = useState<EnvironmentResultRecord[]>([]);
    const [placementResults, setPlacementResults] = useState<ProductPlacementResultRecord[]>([]);
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

    async function deleteEnvResult(id: string) {
        try {
            const res = await fetch("/api/promptDb/delete-env-result", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Sletting feilet");
            setEnvResults((prev) => prev.filter((r) => r.id !== id));
        } catch {
            setError("Feil ved sletting av miljøbilde.");
        }
    }

    async function deletePlacementResult(id: string) {
        try {
            const res = await fetch("/api/promptDb/delete-placement-result", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Sletting feilet");
            setPlacementResults((prev) => prev.filter((r) => r.id !== id));
        } catch {
            setError("Feil ved sletting av produktplassering.");
        }
    }

    async function deletePrompt(id: string) {
        try {
            const res = await fetch("/api/promptDb/delete-prompt", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Sletting feilet");
            setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
        } catch {
            setError("Feil ved sletting av prompt.");
        }
    }

    useEffect(() => {
        const storedTheme = getStoredTheme();
        setDarkModeState(storedTheme === "dark");
    }, []);

    useEffect(() => {
        document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    }, [darkMode]);

    const setDarkMode = (isDark: boolean) => {
        setDarkModeState(isDark);
        saveTheme(isDark ? "dark" : "light");
    };

    async function loadResults() {
        if (activePanel === "results") {
            setActivePanel("none");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/promptDb/get-results");
            if (!res.ok) throw new Error("Henting feilet");
            const data = await res.json();
            setEnvResults(data.envResults || []);
            setPlacementResults(data.placementResults || []);
            setActivePanel("results");
        } catch {
            setError("Feil ved henting av resultater fra databasen.");
        } finally {
            setLoading(false);
        }
    }

    async function loadPrompts() {
        if (activePanel === "prompts") {
            setActivePanel("none");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/promptDb/get-prompts");
            if (!res.ok) throw new Error("Henting feilet");
            const data = await res.json();
            setSavedPrompts(Array.isArray(data) ? data : []);
            setActivePanel("prompts");
        } catch {
            setError("Feil ved henting av lagrede prompts fra databasen.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <DashboardNav darkMode={darkMode} onDarkModeChange={setDarkMode} />
            <main>
                <div className={`${styles.container} ${darkMode ? styles.containerDark : styles.containerLight}`}>

                    <div className={styles.pageHeader}>
                        <h2 className={styles.pageTitle}>AI-Modeller</h2>
                        <p className={styles.pageSubtitle}>
                            Oversikt over tilgjengelige bildegenereringsmodeller og deres egenskaper
                        </p>
                    </div>

                    {/* Modelkort */}
                    <div className={styles.modelsGrid}>
                        <ModelCard
                            icon="🤖"
                            name="GPT Image 1.5"
                            provider="OpenAI"
                            badgeVariant="blue"
                            description="GPT Image 1.5 er en bildegenereringsmodell fra OpenAI som skiller seg ut ved å kombinere sterk instruksjonsforståelse med presis bilderedigering. Modellen er spesielt god på å plassere produkter naturlig i eksisterende scener – den forstår romlig dybde, perspektiv og belysning, og kan sette sammen opptil fem separate bilder i én sammenhengende komposisjon. Ideell der nøyaktig produktgjengivelse og konsistent stil er avgjørende."
                            properties={[
                                { icon: "📐", label: "Størrelse", value: "1536×1024" },
                                { icon: "✏️", label: "Bilderedigering", value: "Ja – inpainting og outpainting" },
                                { icon: "💡", label: "Plasseringsforslag", value: "Via GPT-5.4" },
                                { icon: "⏱️", label: "Responstid", value: "Ca. 25 sek per generering" },
                            ]}
                            pricingRows={[
                                { label: "Snittpris", price: "$0.073 / bilde" },
                            ]}
                            dark={darkMode}
                        />
                        <ModelCard
                            icon="⚡"
                            name="Flux 2 Pro"
                            provider="Black Forest Labs"
                            badgeVariant="purple"
                            description="Flux 2 Pro er en høyytelsesdiffusjonsmodell fra Black Forest Labs som utmerker seg på fotorealistisk detaljrikdom og konsistent estetikk på tvers av genereringer. Modellen er raskere enn GPT Image 1.5 og gir svært naturlig tekstur, materialfølelse og lyssetning – noe som gjør den spesielt egnet for lifestyle-bilder og scener der det visuelle uttrykket er viktigere enn presis instruksjonsoppfølging. Bilde-til-bilde med styrkegrad-kontroll gir full kontroll over hvor mye originalscenen bevares."
                            properties={[
                                { icon: "📐", label: "Størrelse", value: "1536×1024" },
                                { icon: "🔄", label: "Bilde-til-bilde", value: "Ja – med styrkegrad-kontroll" },
                                { icon: "💡", label: "Plasseringsforslag", value: "Via GPT-5.4" },
                                { icon: "⏱️", label: "Responstid", value: "Ca. 15 sek per generering" },
                            ]}
                            pricingRows={[
                                { label: "Standard generering", price: "$0.055 / bilde" },
                            ]}
                            dark={darkMode}
                        />
                    </div>

                    {/* Handlingsknapper */}
                    <div className={styles.actionButtons}>
                        <button
                            onClick={loadResults}
                            disabled={loading}
                            className={activePanel === "results" ? styles.activeBtn : ""}
                        >
                            {loading && activePanel !== "results" ? "Laster..." : activePanel === "results" ? "Skjul Resultater" : "Se Lagrede Resultater"}
                        </button>
                        <button
                            onClick={loadPrompts}
                            disabled={loading}
                            className={activePanel === "prompts" ? styles.activeBtn : ""}
                        >
                            {loading && activePanel !== "prompts" ? "Laster..." : activePanel === "prompts" ? "Skjul Prompts" : "Se Lagrede Prompts"}
                        </button>
                    </div>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    {/* Resultat-panel */}
                    {activePanel === "results" && (
                        <div className={`${styles.panel} ${darkMode ? styles.panelDark : styles.panelLight}`}>
                            <div className={styles.tabRow}>
                                <button
                                    onClick={() => setResultTab("environment")}
                                    className={resultTab === "environment" ? styles.tabActive : styles.tabInactive}
                                >
                                    Miljøbilder ({envResults.length})
                                </button>
                                <button
                                    onClick={() => setResultTab("placement")}
                                    className={resultTab === "placement" ? styles.tabActive : styles.tabInactive}
                                >
                                    Produktplassering ({placementResults.length})
                                </button>
                            </div>

                            {resultTab === "environment" && (
                                <div className={styles.resultsGrid}>
                                    {envResults.length === 0 ? (
                                        <p className={styles.emptyMsg}>Ingen miljøbilder lagret ennå.</p>
                                    ) : (
                                        envResults.map((r) => (
                                            <ProfilResultCard
                                                key={r.id}
                                                imagelink={r.imagelink}
                                                prompt={r.prompt}
                                                model={r.selected_model}
                                                meta={r.category}
                                                created={r.created}
                                                dark={darkMode}
                                                onDelete={() => deleteEnvResult(r.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            )}

                            {resultTab === "placement" && (
                                <div className={styles.resultsGrid}>
                                    {placementResults.length === 0 ? (
                                        <p className={styles.emptyMsg}>Ingen produktplasseringer lagret ennå.</p>
                                    ) : (
                                        placementResults.map((r) => (
                                            <ProfilResultCard
                                                key={r.id}
                                                imagelink={r.imagelink}
                                                prompt={r.prompt}
                                                model={r.selected_model}
                                                meta={parseNames(r.product_names)}
                                                created={r.created}
                                                dark={darkMode}
                                                onDelete={() => deletePlacementResult(r.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Prompt-panel */}
                    {activePanel === "prompts" && (
                        <div className={`${styles.panel} ${darkMode ? styles.panelDark : styles.panelLight}`}>
                            <h3 className={styles.panelTitle}>Lagrede Prompts</h3>
                            {savedPrompts.length === 0 ? (
                                <p className={styles.emptyMsg}>
                                    Ingen lagrede prompts ennå. Bruk &quot;Lagre Prompt&quot;-knappen i kontrollpanelet.
                                </p>
                            ) : (
                                <div className={styles.promptsList}>
                                    {savedPrompts.map((p) => (
                                        <ProfilPromptRow
                                            key={p.id}
                                            prompt={p.prompt}
                                            model={p.model}
                                            type={p.prompt_type}
                                            created={p.created}
                                            dark={darkMode}
                                            onDelete={() => deletePrompt(p.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
