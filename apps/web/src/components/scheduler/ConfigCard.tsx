type Props = {
    title: string
    description: string
    onClick: () => void
}

export default function ConfigCard({ title, description, onClick}: Props) {
    return (
        <button
            onClick={onClick}
            className='bg-[#1D1D29] hover:bg-[#25253A] transition rounded-2xl p-6 text-left shadow-lg w-full'
        >
            <h3 className='text-xl font-semibold text-white'>
                {title}
            </h3>
            <p className='text-gray-400 mt-2'>
                {description}
            </p>
            <span className='text-blue-400 mt-4 inline-block'>
                Configure →
            </span>
        </button>
    )
}