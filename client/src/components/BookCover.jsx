import { BookOpen } from 'lucide-react'

/**
 * Renders a book cover image, or a branded placeholder when coverUrl is null.
 * The parent controls sizing — pass Tailwind classes via `className`.
 * e.g. <BookCover className="w-full h-48" iconClassName="h-12 w-12" />
 */
const BookCover = ({ coverUrl, title, className = '', iconClassName = 'h-8 w-8' }) => (
  <div className={`overflow-hidden ${className}`}>
    {coverUrl ? (
      <img
        src={coverUrl}
        alt={title ? `Cover of ${title}` : 'Book cover'}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
        <BookOpen className={`text-purple-300 dark:text-purple-600 ${iconClassName}`} />
      </div>
    )}
  </div>
)

export default BookCover
