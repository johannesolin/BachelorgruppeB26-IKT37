import styles from "../app/page.module.css";
import { EditResultCardProps } from "./types";


export const EditResultCard = ( props: EditResultCardProps ) => {
    return (
        <>
            {props.resultDataUrls.length > 0 && (
                <>           
                    <textarea
                    value={props.editResultPrompt}
                    onChange={(e) => props.setEditResultPrompt(e.target.value)}
                    rows={6}
                    placeholder='F.eks: "Ta bort dusjen. Behold alt annet uendret."'              
                    className={`${styles.textarea} ${props.darkMode ? styles.dark : styles.light}`}
                    />
                    <button onClick={props.editFinalImage} disabled={props.busyGen || props.busyScene || props.busyPlacement || props.selectedModel === "" || props.editResultPrompt === ""}>{props.busyGen ? "Genererer" : "Rediger bilde"}</button>
                </>
            )} 
        </>
    )
}