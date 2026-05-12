"use client";
import { createPortal } from "react-dom";
import { StoringModalProps } from "./types";
import styles from "../app/page.module.css";

export function StoringModal( props: StoringModalProps ) {
    if(!props.busyDatabase) return null;

    return createPortal(
        <div className={styles.modalOverlayShow}>
            <div className={`${styles.modal} ${styles.configSection} ${
              props.darkMode ? styles.dark : styles.light
            }`}>
                <h2 className={`${styles.heading2} ${props.darkMode ? styles.dark : styles.light}`}>
                    Lagrer...
                </h2>
                <div className={styles.spinner} />
            </div>
        </div>,
        document.body
    );
}
