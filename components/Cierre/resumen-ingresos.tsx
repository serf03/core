import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Ingreso = {
  tipo: string
  monto: number
}

type ResumenIngresosProps = {
  ingresos: Ingreso[]
  setIngresos: React.Dispatch<React.SetStateAction<Ingreso[]>>
  onAvanzar: () => void
}

export function ResumenIngresos({ ingresos, setIngresos, onAvanzar }: ResumenIngresosProps) {
  const [nuevoIngreso, setNuevoIngreso] = useState({ tipo: "", monto: 0 })

  useEffect(() => {
    // Simular obtención de ingresos diarios
    const obtenerIngresosDiarios = async () => {
      // Aquí iría la llamada a la API
      const ingresosSimulados = [
        { tipo: "Efectivo", monto: 50000 },
        { tipo: "Tarjeta", monto: 30000 },
        { tipo: "Transferencia", monto: 20000 },
      ]
      setIngresos(ingresosSimulados)
    }
    obtenerIngresosDiarios()
  }, [setIngresos])

  const agregarIngreso = () => {
    if (nuevoIngreso.tipo && nuevoIngreso.monto > 0) {
      setIngresos([...ingresos, nuevoIngreso])
      setNuevoIngreso({ tipo: "", monto: 0 })
    }
  }

  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resumen de Ingresos</h2>
      <ul className="mb-4">
        {ingresos.map((ingreso, index) => (
          <li key={index} className="flex justify-between mb-2">
            <span>{ingreso.tipo}</span>
            <span>RD${ingreso.monto.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold mb-4">
        <span>Total</span>
        <span>RD${totalIngresos.toFixed(2)}</span>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Tipo de ingreso"
          value={nuevoIngreso.tipo}
          onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, tipo: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Monto"
          value={nuevoIngreso.monto || ""}
          onChange={(e) => setNuevoIngreso({ ...nuevoIngreso, monto: Number.parseFloat(e.target.value) || 0 })}
        />
        <Button onClick={agregarIngreso}>Agregar</Button>
      </div>
      <Button onClick={onAvanzar}>Continuar</Button>
    </div>
  )
}

