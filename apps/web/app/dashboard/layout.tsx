import Navbar from '@/src/components/navbars/Navbar';
import Sidebar from '@/src/components/layout/LeftSidebar';

export default function({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className='flex min-h-screen bg-gray-50 dark:bg-[#121314] transition-colors'>
            <Navbar />
            <main>{children}</main>
        </div>
    )
}