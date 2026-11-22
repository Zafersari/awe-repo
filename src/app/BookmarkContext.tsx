import { createContext, useContext } from "react";

interface BookmarkContextValue {
  bookmarks: string[];
  toggleBookmark: (evidenceId: string) => void;
}

export const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function useBookmarks(): BookmarkContextValue {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within the BookmarkContext.");
  }
  return context;
}
