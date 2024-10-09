import toast from "react-hot-toast"
import * as firebaseServices from "../lib/firebaseServices"
import { Product } from "./types"


export const handleAddProduct = async (newProduct: Product) => {
    try {
        await firebaseServices.addProduct(newProduct)
        toast.success('Producto agregado exitosamente')
    } catch (error) {
        console.error("Error adding product: ", error)
        toast.error("Error al agregar el producto")
    }
}
