'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a media query matches
 * @param query The media query to check
 * @returns A boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);

    // Initial check
    setMatches(media.matches);

    // Add listener for changes
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);

    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
