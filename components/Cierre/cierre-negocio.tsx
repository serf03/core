"use client"

import { useState } from "react"
import { ResumenIngresos } from "./resumen-ingresos"
import { IngresoDenominaciones } from "./ingreso-denominaciones"
import { ComparacionIngresos } from "./comparacion-ingresos"
import { ConfirmacionCierre } from "./confirmacion-cierre"

// Tipos
type Ingreso = {
  tipo: string
  monto: number
}

type Denominacion = {
  valor: number
  cantidad: number
}

export default function CierreNegocio() {
  const [paso, setPaso] = useState(1)
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [denominaciones, setDenominaciones] = useState<Denominacion[]>([])
  const [totalContado, setTotalContado] = useState(0)
  const [diferencia, setDiferencia] = useState(0)

  const avanzarPaso = () => setPaso(paso + 1)
  const retrocederPaso = () => setPaso(paso - 1)

  const handleFinalizarCierre = async () => {
    // Aquí iría la lógica para registrar el cierre en la base de datos
    console.log("Cierre finalizado", { ingresos, denominaciones, totalContado, diferencia })
    // Simular una llamada a la API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Cierre registrado con éxito")
    // Reiniciar el proceso
    setPaso(1)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cierre de Negocio</h1>
      {paso === 1 && <ResumenIngresos ingresos={ingresos} setIngresos={setIngresos} onAvanzar={avanzarPaso} />}
      {paso === 2 && (
        <IngresoDenominaciones
          denominaciones={denominaciones}
          setDenominaciones={setDenominaciones}
          setTotalContado={setTotalContado}
          onAvanzar={avanzarPaso}
          onRetroceder={retrocederPaso}
        />
      )}
      {paso === 3 && (
        <ComparacionIngresos
          ingresos={ingresos}
          totalContado={totalContado}
          setDiferencia={setDiferencia}
          onAvanzar={avanzarPaso}
          onRetroceder={retrocederPaso}
        />
      )}
      {paso === 4 && (
        <ConfirmacionCierre
          ingresos={ingresos}
          denominaciones={denominaciones}
          totalContado={totalContado}
          diferencia={diferencia}
          onConfirmar={handleFinalizarCierre}
          onRetroceder={retrocederPaso}
        />
      )}
    </div>
  )
}

