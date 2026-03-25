
export default function Modal({ children }: { children: React.ReactNode }) {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div
                className='absolute inset-0 bg-black/30 backdrop-blur-sm'
            />
            <div className='relative z-10'>
                {children}
            </div>
        </div>
    )
}