'use client';

import AdminDashboard from '@/components/common/AdminDashboard';
import UserDashboard from '@/components/common/UserDashboard';
import { UserContext } from '@/context/userContext'
import Head from 'next/head';
import Link from 'next/link';
import React, { useContext } from 'react'

const dashboard = () => {
    const { userData, authenticated, activeTab, fetchUserData } = useContext(UserContext);

    return (
        <React.Fragment>
            <Head>
                <link rel="icon" href="/favicon.png" type="image/png" sizes="70x70" />
                <title>HuntHive Dashboard – Track, Review, and Manage Applications</title>
                <meta name="description" content="View, manage, and update all your job applications from your HuntHive dashboard — stay in control of your career search with organized insights." />
            </Head>

            {authenticated ? (
                <>
                    {userData?.type === 'admin' ? (
                        <AdminDashboard userData={userData} activeTab={activeTab} fetchUserData={fetchUserData} />
                    ) : (
                        <UserDashboard userData={userData} activeTab={activeTab} fetchUserData={fetchUserData} />
                    )}
                </>
            ) : (
                <div className="w-full flex-1 md:h-screen h-auto min-h-0 bg-white md:px-6 px-0 py-6">
                    <div className='bg-[#EDEBE9] w-full h-full flex flex-col items-center justify-center md:rounded-2xl rounded-none px-8 py-8 relative overflow-hidden'>
                        <div className='w-full capitalize text-center'>not authenticated, please login first!</div>
                        <div className='w-full text-center mt-4 flex items-center justify-center'>
                            <p className='text-sm text-[#1a202c] flex flex-row gap-2'>
                                <span className='font-medium'>Already have an account?</span>
                                <Link href='/auth/login' className='font-bold hover:underline cursor-pointer'>Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}

export default dashboard