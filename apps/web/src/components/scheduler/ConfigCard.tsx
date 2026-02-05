type Props = {
    title: string
    description: string
    active?: boolean
    onClick: () => void
}

export default function ConfigCard({ title, description, active, onClick}: Props) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-2xl p-6 transition
                ${active ? 'bg-[#1D1D29] ring-2 ring-blue-500' : 'bg-[#1D1D29] hover:bg-gray-700'}    
            `}
        >
            <h3 className='text-xl font-semibold'>{title}</h3>
            <p className='text-gray-400 mt-1'>{description}</p>
            <br />

            {/* <span className='text-blue-400 mt-4 inline-block'>
                {active ? 'Close' : 'Configure'}
            </span> */}
        </div>
    )
}