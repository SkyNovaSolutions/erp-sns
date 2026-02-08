import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <Topbar />
            <main className="ml-64 pt-16 p-6">
                {children}
            </main>
        </div>
    );
}
