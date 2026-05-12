"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { LoadingModalProps } from "./types";
import styles from "../app/page.module.css";

const BASE_SECONDS: Record<string, number> = {
  "gpt-image-1.5": 25,
  "flux-2-pro": 15,
};

export function LoadingModal(props: LoadingModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!props.busyGen) return;

    const start =
      props.estimatedSeconds ??
      BASE_SECONDS[props.selectedModel] ??
      20;

    setSecondsLeft(start);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [props.busyGen, props.selectedModel, props.estimatedSeconds]);

  if (!props.busyGen) return null;

  return createPortal(
    <div className={styles.modalOverlayShow}>
      <div
        className={`${styles.modal} ${styles.configSection} ${
          props.darkMode ? styles.dark : styles.light
        }`}
      >
        <h2
          className={`${styles.heading2} ${
            props.darkMode ? styles.dark : styles.light
          }`}
        >
          Laster...
        </h2>
        <p className={styles.countdownText}>
          {secondsLeft > 0
            ? `Ca. ${secondsLeft} sek gjenstår`
            : "Fullfører..."}
        </p>
        <div className={styles.spinner} />
      </div>
    </div>,
    document.body
  );
}
