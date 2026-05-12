"use client";
import { useState } from "react";
import styles from "../app/profil/page.module.css";
import { ProfilPromptRowProps } from "./types";
import { CopyIcon, CheckIcon, TrashIcon } from "./Icons";
import { formatDate } from "../lib/helperFunctions/formatDate";

export function ProfilPromptRow(props: ProfilPromptRowProps) {
    const [copied, setCopied] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function copyPrompt() {
        await navigator.clipboard.writeText(props.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
        <div className={`${styles.promptRow} ${props.dark ? styles.promptRowDark : styles.promptRowLight} ${deleting ? styles.rowDeleting : ""}`}>
            <div className={styles.promptHeader}>
                {props.model && <span className={styles.modelTag}>{props.model}</span>}
                <span className={`${styles.typeTag} ${props.type === "scene" ? styles.tagScene : styles.tagPlacement}`}>
                    {props.type === "scene" ? "Scenebilde" : props.type === "placement" ? "Plassering" : props.type}
                </span>
                <span className={`${styles.resultDate} ${props.dark ? styles.resultDateDark : styles.resultDateLight}`}>
                    {formatDate(props.created)}
                </span>
                <button
                    type="button"
                    className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ""}`}
                    onClick={copyPrompt}
                    disabled={deleting}
                    title="Kopier prompt"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "Kopiert" : "Kopier"}
                </button>
                {props.onDelete && (
                    <button
                        type="button"
                        className={styles.deletePromptBtn}
                        onClick={handleDelete}
                        disabled={deleting}
                        title="Slett prompt"
                    >
                        {deleting
                            ? <span className={styles.deleteBtnSpinner} />
                            : <TrashIcon />
                        }
                    </button>
                )}
            </div>
            <p className={styles.promptText}>{props.prompt}</p>
        </div>
    );
}
