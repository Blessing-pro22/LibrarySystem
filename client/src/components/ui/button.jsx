import { cn } from "../../lib/utils"

const Button = ({ className, variant = "default", size = "default", ...props }) => {
  const variants = {
    default: "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300",
    destructive: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300",
    outline: "border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200",
    ghost: "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-all duration-200",
    link: "text-purple-600 dark:text-purple-400 underline-offset-4 hover:underline transition-all duration-200",
  }

  const sizes = {
    default: "h-11 px-6 py-2 rounded-xl",
    sm: "h-9 rounded-lg px-4 text-sm",
    lg: "h-13 rounded-xl px-8 text-lg",
    icon: "h-10 w-10 rounded-xl",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export default Button
