import React, { useContext } from 'react';
import Head from 'next/head';
import { UserContext } from '../context/userContext';
import Loader from '@/components/common/Loader';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { DashboardIcon, EnterIcon, ExitIcon, GitHubLogoIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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
                <div className="flex flex-col w-full min-h-screen h-screen overflow-hidden items-center">

                    <main className="w-full flex flex-col gap-8 row-start-2 sm:items-start">

                        <div className='w-full flex flex-row gap-4 text-lg font-medium items-center justify-between py-4 px-16 border-b border-border'>
                            <Link href='/' className='cursor-pointer'>
                                <Image src='/xbox.svg' alt='logo' width={200} height={80} className='md:w-28' />
                            </Link>
                            <div className='w-auto flex flex-row gap-2'>
                                <Link
                                    href="https://github.com/the-bipu/jobs-tracker"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant='default' className='cursor-pointer'>
                                        <GitHubLogoIcon className='w-5 h-5' />
                                        GitHub
                                    </Button>
                                </Link>
                                {!authenticated ? (
                                    <Link href="/auth/login">
                                        <Button variant='yellowish' className='cursor-pointer'>
                                            <EnterIcon className='w-5 h-5' />
                                            Login
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className='flex flex-row gap-2 items-center'>
                                        <Button
                                            onClick={handleLogout}
                                            variant={'greenry'} className='cursor-pointer'
                                        >
                                            <ExitIcon className='w-5 h-auto' />
                                            Logout
                                        </Button>
                                        <Link href="/dashboard">
                                            <Button variant='yellowish' className='cursor-pointer'>
                                                <DashboardIcon className='w-5 h-5' />
                                                Dashboard
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='w-full px-16 pt-8 h-auto flex flex-col items-center justify-center'>
                            <div className='w-8/12 flex flex-col items-center justify-center text-center'>
                                <h1 className='text-5xl font-bold text-center mb-4'>Work Smarter on Your Job Hunt.</h1>
                                <p className='w-2/3 text-lg text-center text-muted-foreground mb-4'>
                                    Replace sticky notes and spreadsheets with an intelligent application management system.
                                </p>
                                {authenticated && userData ? (
                                    <Link href="/dashboard">
                                        <Button variant={'greenry'} className='text-xl font-light px-6 pb-6 pt-5 cursor-pointer'>Dashboard</Button>
                                    </Link>
                                ) : (
                                    <Link href="/auth/login">
                                        <Button variant={'greenry'} className='text-xl font-light px-6 pb-6 pt-5 cursor-pointer'>Get Started</Button>
                                    </Link>
                                )}
                                <Image src={'/job-search.jpg'} alt="Job Search" width={600} height={400} className="mt-10 w-full border-6 border-white rounded-lg shadow-lg" />
                            </div>
                        </div>

                    </main>
                </div>
            )}
        </React.Fragment>
    )
}

export default Index