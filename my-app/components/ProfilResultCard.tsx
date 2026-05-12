"use client";
import { useState } from "react";
import styles from "../app/profil/page.module.css";
import { ProfilResultCardProps } from "./types";
import { DownloadIcon, TrashIcon } from "./Icons";
import { formatDate } from "../lib/helperFunctions/formatDate";

export function ProfilResultCard(props: ProfilResultCardProps) {
    const [imgError, setImgError] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const proxyUrl = `/api/images?path=${encodeURIComponent(props.imagelink)}`;

    function downloadImage() {
        const a = document.createElement("a");
        a.href = proxyUrl;
        a.download = "generert-bilde.jpg";
        a.click();
    }

    async function handleDelete() {
        if (!props.onDelete) return;
        setDeleting(true);
        try {
            await props.onDelete();
        } catch {
            setDeleting(false);
        }
    }

    return (
        <div className={`${styles.resultCard} ${props.dark ? styles.resultCardDark : styles.resultCardLight} ${deleting ? styles.cardDeleting : ""}`}>
            <div className={styles.resultImageWrapper}>
                {imgError ? (
                    <span className={styles.imagePlaceholder}>Bilde utilgjengelig</span>
                ) : (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={proxyUrl}
                            alt="Generert bilde"
                            className={styles.resultImg}
                            onError={() => setImgError(true)}
                        />
                        {props.onDelete && (
                            <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={handleDelete}
                                disabled={deleting}
                                title="Slett bilde"
                            >
                                {deleting
                                    ? <span className={styles.deleteBtnSpinner} />
                                    : <TrashIcon />
                                }
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.downloadBtn}
                            onClick={downloadImage}
                            disabled={deleting}
                            title="Last ned bilde"
                        >
                            <DownloadIcon />
                        </button>
                    </>
                )}
            </div>
            <div className={styles.resultInfo}>
                <div className={`${styles.resultMeta} ${props.dark ? styles.resultMetaDark : styles.resultMetaLight}`}>
                    <span className={styles.modelTag}>{props.model}</span>
                    {props.meta && <span className={styles.metaText}>{props.meta}</span>}
                </div>
                <p className={styles.resultPrompt}>{props.prompt}</p>
                <p className={`${styles.resultDate} ${props.dark ? styles.resultDateDark : styles.resultDateLight}`}>
                    {formatDate(props.created)}
                </p>
            </div>
        </div>
    );
}
