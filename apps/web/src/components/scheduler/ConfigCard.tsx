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
            className={`cursor-pointer rounded-xl p-6 transition
                ${active ? 'bg-[#000000]' : 'bg-[#000000] hover:bg-stone-950'}    
            `}
        >
            <h3 className='text-xl font-semibold'>{title}</h3>
            <p className='text-gray-400 mt-1'>{description}</p>
            <br />
        </div>
    )
}