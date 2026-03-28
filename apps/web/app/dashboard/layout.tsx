import Navbar from '@/src/components/navbars/Navbar';
import Sidebar from '@/src/components/layout/LeftSidebar';

export default function({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className='flex min-h-screen dark:bg-[#f3f4f6] bg-black transition-colors'>
            <Navbar />
            <main>{children}</main>
        </div>
    )
}