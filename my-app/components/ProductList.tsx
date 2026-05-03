"use client"
import { ProductListProps } from "./types";
import styles from "../app/page.module.css";

export function ProductList( props: ProductListProps ){    
    return(
        <>            
            <ul className={`${styles.productListUl}`}>
                {props.filteredProductList?.map((product) => (
                    <li className={`${styles.select} ${props.darkMode ? styles.dark : styles.light} ${styles.productSearchListElement}`} key={product.productId}
                        >
                            {`ID: ${product.productId} - Navn: ${product.name} - Antall bilder: ${product.images.length}`}
                            <button className={`${styles.productSearchListButton}`} onClick={() => props.addProductFromCategorySearch(product)} disabled={props.selectedProducts.length >= 4}>Velg</button>
                    </li>
                ))}
            </ul>
        </>
    )
}