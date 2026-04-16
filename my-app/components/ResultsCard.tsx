import styles from "../app/page.module.css";
import { ResultsCardProps } from "./types";

export const ResultsCard = (props: ResultsCardProps) => {
    return (
        <>
        <section
            className={`${styles.resultSection} ${
              props.darkMode ? styles.dark : styles.light
            }`}
          >
            <h2
              className={`${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}
            >
              Resultat
            </h2>

            {props.resultDataUrls.length === 0 ? (
              <div className={styles.noResults}>Ingen resultat ennå</div>
            ) : (
              <>
                <img
                  src={props.resultDataUrls[props.selectedVariant]}
                  alt="selected-result"
                  className={styles.resultImage}
                />
                <h3
                  className={`${styles.heading3} ${
                    props.darkMode ? styles.dark : styles.light
                  }`}
                >
                  Velg beste variant
                </h3>
                <div className={styles.variantsGrid}>
                  {props.resultDataUrls.map((u, i) => (
                    <button
                      key={i}
                      onClick={() => props.setSelectedVariant(i)}
                      className={`${styles.variantButton} ${
                        i === props.selectedVariant
                          ? styles.variantButtonActive
                          : styles.variantButtonInactive
                      }`}
                    >
                      <img
                        src={u}
                        alt={`variant-${i}`}
                        className={styles.variantImage}
                      />
                    </button>
                  ))}
                </div>                
              </>
            )}
          </section>
        </>
    );
}