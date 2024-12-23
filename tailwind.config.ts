import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-text': '#000000',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
} satisfies Config;
