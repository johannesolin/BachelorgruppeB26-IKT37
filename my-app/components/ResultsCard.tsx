import styles from "../app/page.module.css";
import { ResultsCardProps } from "./types";
import { DownloadIcon } from "./Icons";

function downloadImage(url: string, index: number) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `generert-bilde-${index + 1}.jpg`;
  a.click();
}

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
            <div className={styles.imageWrapper}>
              <img
                src={props.resultDataUrls[props.selectedVariant]}
                alt="selected-result"
                className={styles.resultImage}
              />
              <button
                type="button"
                className={styles.downloadBtn}
                title="Last ned bilde"
                onClick={() =>
                  downloadImage(
                    props.resultDataUrls[props.selectedVariant],
                    props.selectedVariant
                  )
                }
              >
                <DownloadIcon size={16} />
              </button>
            </div>

            <h3
              className={`${styles.heading3} ${
                props.darkMode ? styles.dark : styles.light
              }`}
            >
              Velg beste variant
            </h3>

            <div className={styles.variantsGrid}>
              {props.resultDataUrls.map((u, i) => (
                <div key={i} className={styles.imageWrapper}>
                  <button
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
                  <button
                    type="button"
                    className={styles.downloadBtnVariant}
                    title="Last ned"
                    onClick={() => downloadImage(u, i)}
                  >
                    <DownloadIcon size={10} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
};
