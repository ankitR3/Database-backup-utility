import LeftSidebar from '@/src/components/layout/LeftSidebar';
import RightMainContent from '@/src/components/layout/RightMainContent';

export default function DashboardPage() {
    return (
        <div className='flex h-screen'>
           <LeftSidebar />
           <div className='flex-1 px-10 pt-15'>
            <RightMainContent /> 
           </div>
        </div>
    )
}