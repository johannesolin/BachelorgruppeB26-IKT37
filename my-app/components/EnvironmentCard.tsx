import styles from "../app/page.module.css";
import { EnvironmentCardProps } from "./types";

export const EnvironmentCard = ( props: EnvironmentCardProps ) => {
    return(
        <>
        <h2
              className={`${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}
            >
              Velg miljø og modell
            </h2>
            <select 
              value={props.selectedModel} 
              onChange={(e) => props.setSelectedModel(e.target.value)} 
              className={`${styles.select} ${props.darkMode ? styles.dark : styles.light}`}
              disabled={props.busyGen || props.busyScene}
            >
              <option value="" disabled selected hidden>Velg Modell</option>
              <option value="gpt-image-1.5" key="gpt-image-1.5">GPT-Image-1.5</option>
              <option value="flux-2-pro" key="flux-2-pro">FLUX-2-PRO</option>
            </select>
            <select
              value={props.templateId}
              onChange={(e) => props.setTemplateId(e.target.value)}
              className={`${styles.select} ${props.darkMode ? styles.dark : styles.light}`}
              disabled={props.busyGen || props.busyScene}
            >
              {props.templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
            <button onClick={props.generateScene} disabled={props.busyScene || props.busyGen || props.selectedModel === ""}>{props.sceneUrl === "" ? "Generer Miljø" : "Regenerer Miljø" }</button>
            <div className={styles.sceneContainer}>
              <div className={styles.sceneLabel}>Miljøbilde</div>
              {props.busyScene ? (
                <div className={styles.sceneBusyLoader}>
                  Laster/genererer...
                </div>
              ) : props.sceneUrl ? (
                <>
                  <img
                    src={props.sceneUrl}
                    alt="scene"
                    className={styles.sceneImage}
                  />                 
                    <div className={styles.sceneContainer}>
                    <div className={styles.sceneLabel}>
                        Hva vil du endre i scenen?
                    </div>
                    <input
                        value={props.sceneFixPrompt}
                        onChange={(e) => props.setSceneFixPrompt(e.target.value)}
                        placeholder='F.eks: "Ta bort dusjen. Behold alt annet uendret."'
                        className={`${styles.input} ${styles.inputMargin} ${
                        props.darkMode ? styles.dark : styles.light
                        }`}
                    />
                    <button
                        onClick={props.refineScene}
                        disabled={
                        props.busyScene || props.busyGen || !props.sceneFixPrompt.trim()
                        }
                        className={styles.button}
                    >
                        Fiks scene
                    </button>
                    </div>                
                </>
              ) : (
                <div className={styles.sceneEmpty}>Ingen scene</div>
              )}
            </div>

            <h2
              className={`${styles.heading2Large} ${styles.heading2} ${
                props.darkMode ? styles.dark : styles.light
              }`}
            ></h2>
        </>
    );
}
