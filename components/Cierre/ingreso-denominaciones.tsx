import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Denominacion = {
  valor: number
  cantidad: number
}

type IngresoDenominacionesProps = {
  denominaciones: Denominacion[]
  setDenominaciones: React.Dispatch<React.SetStateAction<Denominacion[]>>
  setTotalContado: React.Dispatch<React.SetStateAction<number>>
  onAvanzar: () => void
  onRetroceder: () => void
}

export function IngresoDenominaciones({
  denominaciones,
  setDenominaciones,
  setTotalContado,
  onAvanzar,
  onRetroceder,
}: IngresoDenominacionesProps) {
  useEffect(() => {
    // Inicializar denominaciones si está vacío
    if (denominaciones.length === 0) {
      setDenominaciones([
        { valor: 2000, cantidad: 0 },
        { valor: 1000, cantidad: 0 },
        { valor: 500, cantidad: 0 },
        { valor: 200, cantidad: 0 },
        { valor: 100, cantidad: 0 },
        { valor: 50, cantidad: 0 },
        { valor: 25, cantidad: 0 },
        { valor: 10, cantidad: 0 },
        { valor: 5, cantidad: 0 },
        { valor: 1, cantidad: 0 },
      ])
    }
  }, [denominaciones, setDenominaciones])

  useEffect(() => {
    const total = denominaciones.reduce((sum, den) => sum + den.valor * den.cantidad, 0)
    setTotalContado(total)
  }, [denominaciones, setTotalContado])

  const handleCantidadChange = (valor: number, nuevaCantidad: number) => {
    setDenominaciones(denominaciones.map((den) => (den.valor === valor ? { ...den, cantidad: nuevaCantidad } : den)))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ingreso de Denominaciones</h2>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th className="text-left">Denominación</th>
            <th className="text-left">Cantidad</th>
            <th className="text-left">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {denominaciones.map((den) => (
            <tr key={den.valor}>
              <td>RD${den.valor}</td>
              <td>
                <Input
                  type="number"
                  value={den.cantidad}
                  onChange={(e) => handleCantidadChange(den.valor, Number.parseInt(e.target.value) || 0)}
                  className="w-20"
                />
              </td>
              <td>RD${(den.valor * den.cantidad).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between">
        <Button onClick={onRetroceder}>Atrás</Button>
        <Button onClick={onAvanzar}>Continuar</Button>
      </div>
    </div>
  )
}

