import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Invoice } from "@/lib/types"
import { motion } from 'framer-motion'
import { useState } from 'react'

interface MakePaymentDialogProps {
    isMakePaymentDialogOpen: boolean
    setIsMakePaymentDialogOpen: (isOpen: boolean) => void
    invoiceToMakePayment: Invoice | null
    confirmMakePayment: (amount: number) => void
}

export default function MakePaymentDialog({
    isMakePaymentDialogOpen,
    setIsMakePaymentDialogOpen,
    invoiceToMakePayment,
    confirmMakePayment
}: MakePaymentDialogProps) {
    const [paymentAmount, setPaymentAmount] = useState<number>(0)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        confirmMakePayment(paymentAmount)
    }

    return (
        <Dialog open={isMakePaymentDialogOpen} onOpenChange={setIsMakePaymentDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Realizar Pago</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-secondary rounded-lg">
                            <div className="text-sm text-secondary-foreground mb-1">Monto Pendiente</div>
                            <div className="text-2xl font-bold">${invoiceToMakePayment?.pendingBalance.toFixed(2)}</div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentAmount" className="text-sm font-medium">
                                Monto a Pagar
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="paymentAmount"
                                    type="number"
                                    value={paymentAmount || ''}
                                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                    max={invoiceToMakePayment?.pendingBalance || 0}
                                    min={0.01}
                                    step={0.01}
                                    className="pl-7 text-lg"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        {paymentAmount > 0 && paymentAmount <= (invoiceToMakePayment?.pendingBalance || 0) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 bg-primary/10 rounded-lg"
                            >
                                <div className="text-sm mb-1">Restante después del pago</div>
                                <div className="text-xl font-semibold text-primary">
                                    ${((invoiceToMakePayment?.pendingBalance || 0) - paymentAmount).toFixed(2)}
                                </div>
                            </motion.div>
                        )}

                        {paymentAmount > (invoiceToMakePayment?.pendingBalance || 0) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 bg-destructive/10 rounded-lg"
                            >
                                <div className="text-sm text-destructive">
                                    El monto excede el balance pendiente
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!paymentAmount || paymentAmount > (invoiceToMakePayment?.pendingBalance || 0)}
                        >
                            Confirmar Pago
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

