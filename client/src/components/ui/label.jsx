import { cn } from "../../lib/utils"

const Label = ({ className, ...props }) => (
  <label
    className={cn(
      "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5 block",
      className
    )}
    {...props}
  />
)

export default Label
