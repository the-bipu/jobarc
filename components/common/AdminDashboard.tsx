import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProfileTab from './ProfileTab';
import JobsTab from './JobsTab';
import ExtraTab from './ExtraTab';

const AdminDashboard = ({ userData, activeTab, fetchUserData }: any) => {
    return (
        <div className='w-full h-full md:h-screen min-h-screen flex flex-row items-start justify-start fixed'>
            <Sidebar />
            <div className='bg-white text-black flex flex-col w-full h-full md:relative fixed'>
                <Topbar />

                {activeTab === 'profile' && (
                    <ProfileTab userData={userData} fetchUserData={fetchUserData} />
                )}

                {activeTab === 'jobs' && (
                    <JobsTab userData={userData} />
                )}

                {activeTab === 'extra' && (
                    <ExtraTab />
                )}
            </div>
        </div>
    )
}

export default AdminDashboard