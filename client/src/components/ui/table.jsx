import { cn } from "../../lib/utils"

const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
)

const TableHeader = ({ className, ...props }) => (
  <thead className={cn("[&_tr]:border-b-2 [&_tr]:border-gray-200 dark:[&_tr]:border-gray-700", className)} {...props} />
)

const TableBody = ({ className, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
)

const TableFooter = ({ className, ...props }) => (
  <tfoot className={cn("border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
)

const TableRow = ({ className, ...props }) => (
  <tr className={cn("border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/10 data-[state=selected]:bg-purple-100 dark:data-[state=selected]:bg-purple-900/20", className)} {...props} />
)

const TableHead = ({ className, ...props }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-semibold text-gray-700 dark:text-gray-300 [&:has([role=checkbox])]:pr-0", className)} {...props} />
)

const TableCell = ({ className, ...props }) => (
  <td className={cn("p-4 align-middle text-gray-600 dark:text-gray-400 [&:has([role=checkbox])]:pr-0", className)} {...props} />
)

const TableCaption = ({ className, ...props }) => (
  <caption className={cn("mt-4 text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
)

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
