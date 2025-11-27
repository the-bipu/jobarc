import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { UserContext } from '@/context/userContext';
import { AvatarIcon, BackpackIcon, ExitIcon, GlobeIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

const Sidebar = () => {
    const { activeTab, setActiveTab, userData, sideBar, setSideBar } = useContext(UserContext);

    const handleLogout = async () => {
        try {
            await signOut({
                redirect: true,
                callbackUrl: '/auth/login'
            });

            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout. Please try again.');
        }
    };

    return (
        <div className={`fixed md:relative bg-[#1a1a1a] h-full min-w-72 max-w-80 flex flex-col items-center justify-start py-4 px-8 ${sideBar ? 'left-0' : 'md:left-0 -left-76'} transition-all duration-300 z-50`}>
            <div className='w-auto flex flex-row gap-4 items-center justify-start'>
                <Link href='/' className='cursor-pointer'>
                    <Image src='/xbox.svg' alt='logo' width={200} height={80} className='w-28' />
                </Link>
            </div>

            <div className='mt-12 flex flex-col w-full h-full items-start justify-between'>

                <div className='w-full h-full flex-1 flex flex-col gap-2'>
                    <div onClick={() => { setActiveTab("profile"); setSideBar(false) }} className={`text-[#606060] flex flex-row gap-3 items-center rounded-tr rounded-br justify-start text-lg py-1 px-3 cursor-pointer transition-all duration-200 ${activeTab === 'profile' && 'bg-[#2D2D2E] hover:bg-[#3A3A3B] text-white border-l-2 border-l-[#c1c1c1]'}`}>
                        <AvatarIcon className='w-6 h-auto' />
                        <span>Profile</span>
                    </div>

                    <div onClick={() => { setActiveTab("jobs"); setSideBar(false) }} className={`text-[#606060] flex flex-row gap-3 items-center rounded-tr rounded-br justify-start text-lg py-1 px-3 cursor-pointer transition-all duration-200 ${activeTab === 'jobs' && 'bg-[#2D2D2E] hover:bg-[#3A3A3B] text-white border-l-2 border-l-[#c1c1c1]'}`}>
                        <BackpackIcon className='w-6 h-auto' />
                        <span>Jobs</span>
                    </div>

                    {userData?.type === 'admin' && (
                        <div onClick={() => { setActiveTab("extra"); setSideBar(false) }} className={`text-[#606060] flex flex-row gap-3 items-center rounded-tr rounded-br justify-start text-lg py-1 px-3 cursor-pointer transition-all duration-200 ${activeTab === 'extra' && 'bg-[#2D2D2E] hover:bg-[#3A3A3B] text-white border-l-2 border-l-[#c1c1c1]'}`}>
                            <GlobeIcon className='w-6 h-auto' />
                            <span>Note</span>
                        </div>
                    )}
                </div>

                <div className={`text-[#606060] w-full flex flex-row gap-3 items-center justify-start text-lg rounded py-1 px-3 border border-[#1a1a1a] cursor-pointer transition-all duration-200 hover:text-white hover:border-white`}
                    onClick={handleLogout}>
                    <ExitIcon className='w-6 h-auto' />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    )
}

export default Sidebar