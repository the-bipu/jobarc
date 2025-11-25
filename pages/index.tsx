import React, { useContext } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { UserContext } from '../context/userContext';
import Loader from '@/components/common/Loader';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { DashboardIcon, EnterIcon, ExitIcon, GitHubLogoIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

const Index = () => {
    const { authenticated, userData, loading } = useContext(UserContext);

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
        <React.Fragment>
            <Head>
                <link rel="icon" href="/favicon.ico" type="image/ico" sizes="70x70" />
                <title>Job Tracker</title>
                <meta name="description" content="Use this to track what companies you've applied." />
            </Head>

            {loading ? (
                <Loader />
            ) : (
                <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

                    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

                        {(authenticated && userData) ? (
                            <ul className="list-inside list-decimal text-xl text-center sm:text-left">
                                <li>This is the starters pack for nextjs projects. and the person is {userData?.name}</li>
                            </ul>
                        ) : (
                            <ul className="list-inside list-decimal text-xl text-center sm:text-left">
                                <li>This is the starters pack for nextjs projects.</li>
                            </ul>
                        )}

                    </main>
                    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                        <Link
                            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                            href="https://github.com/the-bipu"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <GitHubLogoIcon className='w-5 h-5' />
                            GitHub →
                        </Link>
                        {!authenticated ? (
                            <Link
                                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                                href="/auth/login"
                            >
                                <EnterIcon className='w-5 h-5' />
                                Login →
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 hover:underline hover:underline-offset-4 cursor-pointer bg-transparent border-none text-inherit"
                                >
                                    <ExitIcon className='w-5 h-auto' />
                                    Logout →
                                </button>
                                <Link
                                    href='/dashboard'
                                    className="flex items-center gap-2 hover:underline hover:underline-offset-4 cursor-pointer bg-transparent border-none text-inherit"
                                >
                                    <DashboardIcon className='w-5 h-auto' />
                                    Dashboard →
                                </Link>
                            </>
                        )}
                    </footer>
                </div>
            )}
        </React.Fragment>
    )
}

export default Index