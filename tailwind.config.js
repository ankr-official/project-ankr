/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {},
    },
    plugins: [
        plugin(({ addVariant }) => {
            // 마우스/트랙패드 등 정밀 포인터 장치에서만 hover 적용
            addVariant('mouse', '@media (hover: hover) and (pointer: fine)');
        }),
    ],
};
