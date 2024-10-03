import { LucideIcon, LucideProps } from 'lucide-react';
import React from 'react';
import { cn } from "../../lib/utils";


// Hacer que 'icon' sea opcional
export interface IconProps extends Omit<LucideProps, 'ref'> {
    icon?: LucideIcon; // Icon ahora es opcional
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ icon: IconComponent, className, ...props }, ref) => {
        return IconComponent ? (
            <IconComponent
                ref={ref}
                className={cn("w-4 h-4", className)}
                {...props}
            />
        ) : null; // Si no hay 'icon', devuelve null
    }
);

Icon.displayName = "Icon";

export { Icon };
