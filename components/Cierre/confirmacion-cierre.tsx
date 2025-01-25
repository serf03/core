import { Button } from "@/components/ui/button"

type Ingreso = {
  tipo: string
  monto: number
}

type Denominacion = {
  valor: number
  cantidad: number
}

type ConfirmacionCierreProps = {
  ingresos: Ingreso[]
  denominaciones: Denominacion[]
  totalContado: number
  diferencia: number
  onConfirmar: () => void
  onRetroceder: () => void
}

export function ConfirmacionCierre({
  ingresos,
  denominaciones,
  totalContado,
  diferencia,
  onConfirmar,
  onRetroceder,
}: ConfirmacionCierreProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Confirmación de Cierre</h2>
      <div className="mb-4">
        <h3 className="font-semibold">Resumen de Ingresos:</h3>
        <ul>
          {ingresos.map((ingreso, index) => (
            <li key={index}>
              {ingreso.tipo}: RD${ingreso.monto.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Denominaciones:</h3>
        <ul>
          {denominaciones.map((den) => (
            <li key={den.valor}>
              RD${den.valor}: {den.cantidad}
            </li>
          ))}
        </ul>
      </div>
      <p>Total Contado: RD${totalContado.toFixed(2)}</p>
      <p className={`font-bold ${diferencia >= 0 ? "text-green-600" : "text-red-600"}`}>
        Diferencia: RD${diferencia.toFixed(2)}
      </p>
      <div className="flex justify-between mt-4">
        <Button onClick={onRetroceder}>Atrás</Button>
        <Button onClick={onConfirmar} className="bg-green-600 hover:bg-green-700">
          Confirmar Cierre
        </Button>
      </div>
    </div>
  )
}

