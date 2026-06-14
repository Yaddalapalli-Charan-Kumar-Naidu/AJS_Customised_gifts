import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          primary: "#F4A7B9",
          deep: "#E8748A",
          light: "#FFD6E7",
          50: "#FFF0F6",
          100: "#FFD6E7",
          200: "#FFADD2",
          300: "#F4A7B9",
          400: "#EC7FAB",
          500: "#E8748A",
          600: "#D63F6F",
          700: "#B52E59",
          800: "#8C2044",
          900: "#641532",
        },
        lavender: {
          DEFAULT: "#C4A8E0",
          light: "#E8DEFF",
          dark: "#9B72CF",
        },
        "rose-gold": {
          DEFAULT: "#C9956A",
          light: "#E8C4A8",
          dark: "#A8744A",
        },
        cream: {
          DEFAULT: "#FDF6EC",
          dark: "#F5E6D0",
        },
        purple: {
          soft: "#9B72CF",
          light: "#C4A8E0",
        },
        neon: {
          pink: "#FF85C2",
          purple: "#B57BFF",
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 200, 220, 0.25)",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["var(--font-dancing)", "cursive"],
      },
      backgroundImage: {
        "luxury-gradient": "linear-gradient(135deg, #FDF6EC 0%, #FFE4F0 30%, #E8DEFF 60%, #FDF6EC 100%)",
        "hero-gradient": "linear-gradient(135deg, #1a0a1a 0%, #2d1433 30%, #1a0d2e 60%, #0d1a2d 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,200,220,0.08) 100%)",
        "glow-pink": "radial-gradient(circle at center, rgba(232,116,138,0.4) 0%, transparent 70%)",
        "glow-purple": "radial-gradient(circle at center, rgba(155,114,207,0.3) 0%, transparent 70%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s infinite",
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.6s ease forwards",
        "slide-down": "slideDown 0.4s ease forwards",
        "scale-in": "scaleIn 0.4s ease forwards",
        "ribbon": "ribbon 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(3deg)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
          "50%": { opacity: "0.5", transform: "scale(1.3) rotate(180deg)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(232,116,138,0.4), 0 0 40px rgba(155,114,207,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(232,116,138,0.7), 0 0 80px rgba(155,114,207,0.4)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        ribbon: {
          "0%, 100%": { transform: "translateX(0) rotate(-5deg)" },
          "50%": { transform: "translateX(10px) rotate(5deg)" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(232,116,138,0.15), 0 2px 8px rgba(155,114,207,0.1)",
        "glass-lg": "0 16px 64px rgba(232,116,138,0.2), 0 4px 16px rgba(155,114,207,0.15)",
        "glow-pink": "0 0 30px rgba(232,116,138,0.5), 0 0 60px rgba(232,116,138,0.2)",
        "glow-purple": "0 0 30px rgba(155,114,207,0.5), 0 0 60px rgba(155,114,207,0.2)",
        "glow-gold": "0 0 30px rgba(201,149,106,0.5), 0 0 60px rgba(201,149,106,0.2)",
        luxury: "0 20px 60px rgba(232,116,138,0.2), 0 8px 24px rgba(0,0,0,0.15)",
        card: "0 4px 24px rgba(232,116,138,0.1), 0 1px 4px rgba(0,0,0,0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
