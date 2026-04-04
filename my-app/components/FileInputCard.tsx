import styles from "../app/page.module.css";

export function FileInputCard(){
    return (
        <>
        <div
              className={`${styles.flexContainerStart} ${styles.flexContainer}`}
            >
              <div
                className={`${styles.fileListContainer} ${
                  darkMode ? styles.dark : styles.light
                } ${
                  selectedProducts.filter((p) => p.kind === "last-opp").length >
                  0
                    ? styles.filled
                    : styles.empty
                }`}
              >
                {selectedProducts.filter((p) => p.kind === "last-opp")
                  .length === 0
                  ? "Velg Fil fra Datamaskin. (Ingen fil valgt)"
                  : selectedProducts
                      .filter((p) => p.kind === "last-opp")
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`${styles.fileItem} ${
                            darkMode ? styles.dark : styles.light
                          }`}
                        >
                          {p.kind === "last-opp" && p.file.name}
                        </div>
                      ))}
              </div>
              <label className={styles.fileLabel}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const input = document.querySelector(
                      'input[type="file"][data-file-input]',
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                  className={`${styles.buttonCompact} ${
                    darkMode
                      ? styles.buttonCompactDark
                      : styles.buttonCompactLight
                  }`}
                  onMouseEnter={(e) => {
                    e.currentTarget.classList.add(
                      darkMode
                        ? styles.buttonCompactDarkHover
                        : styles.buttonCompactLightHover,
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.classList.remove(
                      darkMode
                        ? styles.buttonCompactDarkHover
                        : styles.buttonCompactLightHover,
                    );
                  }}
                >
                  Legg til fil
                </button>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => addUploads(e.target.files)}
                  disabled={selectedProducts.length >= 4}
                  data-file-input
                  className={styles.fileInput}
                />
              </label>
            </div>
        </>
    );
}