import { useEffect } from "react"
import { Button } from "@/components/ui/button"

type Ingreso = {
  tipo: string
  monto: number
}

type ComparacionIngresosProps = {
  ingresos: Ingreso[]
  totalContado: number
  setDiferencia: React.Dispatch<React.SetStateAction<number>>
  onAvanzar: () => void
  onRetroceder: () => void
}

export function ComparacionIngresos({
  ingresos,
  totalContado,
  setDiferencia,
  onAvanzar,
  onRetroceder,
}: ComparacionIngresosProps) {
  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0)

  useEffect(() => {
    setDiferencia(totalContado - totalIngresos)
  }, [totalContado, totalIngresos, setDiferencia])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Comparación de Ingresos</h2>
      <div className="mb-4">
        <p>Total Ingresos Registrados: RD${totalIngresos.toFixed(2)}</p>
        <p>Total Contado: RD${totalContado.toFixed(2)}</p>
        <p className={`font-bold ${totalContado - totalIngresos >= 0 ? "text-green-600" : "text-red-600"}`}>
          Diferencia: RD${(totalContado - totalIngresos).toFixed(2)}
        </p>
      </div>
      <div className="flex justify-between">
        <Button onClick={onRetroceder}>Atrás</Button>
        <Button onClick={onAvanzar}>Continuar</Button>
      </div>
    </div>
  )
}

