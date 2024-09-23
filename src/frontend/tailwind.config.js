/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/**/**/*.{js,ts,jsx,tsx}",

  ],
  theme: {
    container: {
      screens: {
        xs: '100%',
        sm: '100%',
        md: '100%',
        lg: '100%',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
      },
      colors:{
        primary :{
          100:"#0047FF",
          200:"#1c1d21",
          300:"#25262c",
          400:"#24262C",
          500:"#254392"
        },
        grey:{
          100:'#2C2F37',
          200:"#222D46",
          300:"#2D3650",
          400:"#24262b",
          650: "#8A8D97",
          700:"#1C2841",
          800:'#353B49',
          900:"#1D2948"

        },
        blue: {
          150: "#0047FF",
          200:"#162850",
          300:"#152d63",
          400:"#212D4C",
          500:"#1d2a48",
          600:"#182340",
          700:"#42E8E0",
          800:"#0F73F2",
          900:"#00FFF3"
        },
        slate: {
          500:'#222D46',
        },
        dark: {
          100:"#1B1D21",
          200:"#0D131C",
          500: "#222222",
          600: "#222D46",
          700: "#141F1C",
          800:"#01091F"
        },
        "bluish-green": {
          100: "rgba(8, 172, 133, 0.1)",
          200: "#0F3135",
          500: "#0AB28A",
          600: "#019773",
          700: "#007257",
        },
        green: {
          100:"#08AC85" ,
          200:"#3CCBCD"         
        },
        red:{
          100:"#FD4760"
        },
        orange: {
          100:"#EA6C3B",
        },
        "dark-coal-blue": "#1A2E4A",
        charcoal: "#16223C",
        tungsten: "#222D46",
        "brick-red": "#C12B3D",
        "light-maroon": "#A34455",
        "platform":"rgba(255, 255, 255, 0.05)",
        "sub-text":"rgba(255, 255, 255, 0.60)",
        "error":"#ff4d4f",
        "footer-text":"rgba(255, 255, 255, 0.30)",
        "warning-bg":"rgba(234, 108, 59, 0.1)",
        "hover-menu":"rgba(48, 52, 61, 1)",
        "connect-box":"rgba(29, 41, 72, 1)"
      },
      fontSize: {
        tiny: ["11px", "16px"],
        xxs: ["12px", "18px"],
        xs: ["13px", "24px"],
        sm: ["14px", "22px"],
        md: ["15px", "22px"],
        base: ["16px", "24px"],
        "base-lg": ["18px", "27px"],
        lg: ["20px", "28px"],
        xl: ["24px", "32px"],
        xxl: ["28px", "42px"],
        "xl-1/2": ["32px", "48px"],
        "2xl": ["32px", "40px"],
        "medium":["14px", "15px"]
      }
    },
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      const screens = theme("screens", {});
      addComponents([
        {
          ".container": { width: "100%", margin: "0 auto" },
          ".text-16px": {
            "font-size": "14px",
          },
          ".text-xl": {
            "font-size": "17px",
          },
          ".text-18px": {
            "font-size": "16px",
          },
          ".text-24px": {
            "font-size": "16px",
          },
          ".text-32px": {
            "font-size": "18px",
          },
          ".text-40px": {
            "font-size": "20px",
          },
          ".text-55px": {
            "font-size": "22px",
          },
          ".text-60px": {
            "font-size": "25px",
          },
          ".text-64px": {
            "font-size": "36px",
          },
          ".text-80px": {
            "font-size": "45px",
          },
        },
        {
          [`@media (min-width: ${screens.sm})`]: {
            ".text-16px": {
              "font-size": "16px",
            },
            ".text-xl": {
              "font-size": "17.5px",
            },
            ".text-24px": {
              "font-size": "19px",
            },
            ".text-32px": {
              "font-size": "24px",
            },
            ".text-40px": {
              "font-size": "27px",
            },
            ".text-55px": {
              "font-size": "30px",
            },
            ".text-18px": {
              "font-size": "16px",
            },
            ".text-60px": {
              "font-size": "37px",
            },
            ".text-64px": {
              "font-size": "39px",
            },
            ".text-80px": {
              "font-size": "50px",
            },
          },
        },
        {
          [`@media (min-width: ${screens.md})`]: {
            ".text-18px": {
              "font-size": "18px",
            },
            ".text-xl": {
              "font-size": "18px",
            },
            ".text-24px": {
              "font-size": "20px",
            },
            ".text-32px": {
              "font-size": "26px",
            },
            ".text-40px": {
              "font-size": "30px",
            },
            ".text-55px": {
              "font-size": "32px",
            },
            ".text-60px": {
              "font-size": "40px",
            },
            ".text-64px": {
              "font-size": "42px",
            },
            ".text-80px": {
              "font-size": "55px",
            },
          },
        },
        {
          [`@media (min-width: ${screens.lg})`]: {
            ".text-18px": {
              "font-size": "18px",
            },
            ".text-xl": {
              "font-size": "18.5px",
            },
            ".text-24px": {
              "font-size": "22px",
            },
            ".text-32px": {
              "font-size": "28px",
            },
            ".text-40px": {
              "font-size": "33px",
            },
            ".text-55px": {
              "font-size": "36px",
            },
            ".text-60px": {
              "font-size": "45px",
            },
            ".text-64px": {
              "font-size": "47px",
            },
            ".text-80px": {
              "font-size": "60px",
            },
          },
        },
        {
          [`@media (min-width: ${screens.xl})`]: {
            ".text-18px": {
              "font-size": "18px",
            },
            ".text-xl": {
              "font-size": "19px",
            },
            ".text-24px": {
              "font-size": "23px",
            },
            ".text-32px": {
              "font-size": "30px",
            },
            ".text-40px": {
              "font-size": "36px",
            },
            ".text-55px": {
              "font-size": "45px",
            },
            ".text-60px": {
              "font-size": "50px",
            },
            ".text-64px": {
              "font-size": "53px",
            },
            ".text-80px": {
              "font-size": "70px",
            },
          },
        },
        {
          [`@media (min-width: ${screens["2xl"]})`]: {
            ".container": {
              "max-width": "1686px",
            },
            ".text-xl": {
              "font-size": "20px",
            },
            ".text-18px": {
              "font-size": "18px",
            },
            ".text-24px": {
              "font-size": "24px",
            },
            ".text-32px": {
              "font-size": "32px",
            },
            ".text-40px": {
              "font-size": "40px",
            },
            ".text-55px": {
              "font-size": "55px",
            },
            ".text-60px": {
              "font-size": "60px",
            },
            ".text-64px": {
              "font-size": "64px",
            },
            ".text-80px": {
              "font-size": "80px",
            },
          },
        },
      ]);
    }),

  ],
}
