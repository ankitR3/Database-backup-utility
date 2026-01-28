'use client'

export default function ThemeToggle() {
    function toggleTheme() {
        document.documentElement.classList.toggle('dark')
    }
    return (
        <button
            onClick={toggleTheme}
            type="button"
            title="Toggle theme"
            aria-label="Toggle theme"
            className="p-2 pr-5"
        >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            width="22"
            height="22"
            fill="currentColor"
            viewBox="0 0 32 32"
            className="text-gray-800 dark:text-gray-200 transition-transform duration-150 dark:rotate-180"
        >
            <path d="M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z" />
            <circle cx="16" cy="16" r="8.1" />
        </svg>
        </button>
    )
}