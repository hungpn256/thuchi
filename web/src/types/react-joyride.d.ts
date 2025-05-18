// This file is used to augment the React Joyride types if necessary.
// The library already provides its own types, but we can extend them here if needed.

import 'react-joyride';

declare module 'react-joyride' {
  // Add any additional types or extend existing types if needed

  // Example of extending LOCALE
  export interface Locale {
    // Add Vietnamese translations if needed
    last?: string;
    next?: string;
    back?: string;
    skip?: string;
  }
}
