import Navbar from '@/src/components/layout/Navbar';
import Sidebar from '@/src/components/layout/Sidebar';

export default function({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className='flex min-h-screen bg-gray-50 dark:bg-[#15172A] transition-colors'>
            <Sidebar />
            <div className='flex-1 flex flex-col'>
                <Navbar />
                <main className='p-8'>{children}</main>
            </div>
        </div>
    )
}