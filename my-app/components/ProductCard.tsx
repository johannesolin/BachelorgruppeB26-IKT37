import styles from "../app/page.module.css";
import { ProductCardProps } from "@/components/types";
import { useState } from "react";

export const ProductCard = (props : ProductCardProps) => {
    const [selectedImage, setSelectedImage] = useState<number>(props.product.selectedImage);

    function reduceSelectedImage(){
        if(selectedImage > 0){
            const newIndex = selectedImage - 1;
            console.log(props.selectedProducts[props.index].selectedImage)
            setSelectedImage(newIndex);            
            props.changeSelectedImage(props.index, newIndex);
            console.log(props.selectedProducts[props.index].selectedImage)
        }
    }

    function increaseSelectedImage(){
        if(selectedImage < props.product.images.length-1){
            const newIndex = selectedImage + 1;
            console.log(props.selectedProducts[props.index].selectedImage)
            setSelectedImage(newIndex);            
            props.changeSelectedImage(props.index, newIndex);
            console.log(props.selectedProducts[props.index].selectedImage)
        }
    }

    return (
        <>      
            <div key={props.product.productId} className={styles.productCard}>
                <div className={styles.productCardHeader}>
                <div className={styles.productCardLabel}>
                    {`${props.product.productId}${props.product.name ? ` – ${props.product.name}` : ""}`}
                </div>
                <div className={styles.productCardButtonGroup}>
                    <button
                    onClick={() => props.moveProduct(props.product.productId, -1)}
                    disabled={props.index === 0}
                    title="Flytt opp"
                    >
                    ↑
                    </button>
                    <button
                    onClick={() => props.moveProduct(props.product.productId, 1)}
                    disabled={props.index === props.selectedProducts.length - 1}
                    title="Flytt ned"
                    >
                    ↓
                    </button>
                    <button
                    onClick={() => props.removeProduct(props.product.productId)}
                    title="Fjern"
                    >
                    X
                    </button>
                </div>
                </div>                      
                <img
                    src={props.product.images[selectedImage].href}
                    alt="produkt bilde"
                    className={styles.productImage}
                /><h3>{selectedImage+1}/{props.product.images.length}</h3>
                <button onClick={reduceSelectedImage} disabled={selectedImage < 1}>&#8592;</button>
                <button onClick={increaseSelectedImage} disabled={selectedImage+1 >= props.product.images.length}>&#8594;</button>
            </div>
    </>
    );
}