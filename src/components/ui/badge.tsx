import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent<dyad-problem-report summary="1 problems">
<problem file="src/pages/products/ProductList.tsx" line="76" column="30" code="2322">Type '"destructive" | "success" | "warning"' is not assignable to type '"default" | "destructive" | "outline" | "secondary"'.
  Type '"success"' is not assignable to type '"default" | "destructive" | "outline" | "secondary"'.</problem>
</dyad-problem-report><think>**Analyzing Type Error**

I'm currently focused on a TypeScript error I've encountered within `src/pages/products/ProductList.tsx`. It seems there's a type mismatch concerning the `Badge` component. Specifically, a union type is not assignable to another, causing this type error. I need to determine the root cause, and how to resolve the mismatch in the acceptable types for the prop.


**Expanding Badge Variants**

I've examined the `badge.tsx` file and understand its structure, using `cva` for variant definitions. Now, I'm integrating 'success' and 'warning' variants into the `badgeVariants` using the colors from `tailwind.config.ts`. I am considering how to assign background and text colors using those variables. I'm focusing on ensuring these additions integrate cleanly with existing variants, while also adhering to the established UI/UX design.


**Implementing New Variants**

I've got the `badge.tsx` file open and am updating `badgeVariants` using `cva` to introduce 'success' and 'warning' variants. The plan is to map the `bg` and `text` colors directly using the provided `tailwind.config.ts` variables, ensuring visual consistency. I'm taking care to ensure the new variants integrate with existing definitions, maintaining the overall design.


**Adding New Variants**

I've got the `badge.tsx` file structure in mind, using `cva` for variant definitions. I'm adding 'success' and 'warning' variants, using colors from `tailwind.config.ts`. The new variants' background and text colors are based on the defined variables. I'm focusing on seamless integration, maintaining design consistency.


**Implementing New Variants**

I've got the `badge.tsx` file open and am updating `badgeVariants` using `cva` to introduce 'success' and 'warning' variants. The plan is to map the `bg` and `text` colors directly using the provided `tailwind.config.ts` variables, ensuring visual consistency. I'm taking care to ensure the new variants integrate with existing definitions, maintaining the overall design.

```typescript
// ...
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
      },
    },
// ...
```


**Implementing New Variants**

I've updated the `badge.tsx` file to include 'success' and 'warning' variants within the `badgeVariants` using `cva`. I've mapped the background and text colors from `tailwind.config.ts`, ensuring these new variants seamlessly align with existing ones, preserving the established design. The changes are straightforward and maintain design consistency.


</think>Você está certo, peço desculpas pelo erro. O componente `Badge` não possuía as variantes de cor `success` e `warning` que eu tentei usar.

Vou corrigir isso agora mesmo, adicionando essas variantes ao arquivo do componente `Badge` para que ele aceite as novas cores e exiba o status do estoque corretamente.

<dyad-write path="src/components/ui/badge.tsx" description="Adicionando variantes 'success' e 'warning' ao componente Badge.">
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }