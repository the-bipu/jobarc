import React, { useContext } from 'react';
import Head from 'next/head';
import { UserContext } from '../context/userContext';
import Loader from '@/components/main/loader/Loader';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
                <link rel="icon" href="/favicon.png" type="image/png" sizes="70x70" />
                <title>HuntHive – Organize Your Career Journey</title>
                <meta name="description" content="Stay organized and boost your job hunt with HuntHive — the smart way to log applications and follow up." />
            </Head>

            {loading ? (
                <Loader />
            ) : (
                <div className="flex flex-col w-full min-h-screen h-screen overflow-hidden items-center bg-white">

                    <main className="w-full flex flex-col row-start-2 sm:items-start">

                        <div className='w-full flex flex-row gap-4 text-lg font-medium items-center justify-between py-4 mb-8 md:px-16 px-4'>
                            <Link href='/' className='cursor-pointer'>
                                <Image src='/hunthive.svg' alt='logo' width={200} height={80} className='w-40' />
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Image src='/menu.svg' alt='logo' width={200} height={80} className='w-6 cursor-pointer' />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Shortcut</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link href="https://github.com/the-bipu/jobs-tracker" target="_blank" rel="noopener noreferrer">
                                            GitHub
                                        </Link>
                                    </DropdownMenuItem>
                                    {!authenticated ? (
                                        <DropdownMenuItem>
                                            <Link href="/auth/login">Login</Link>
                                        </DropdownMenuItem>
                                    ) : (
                                        <div className='flex flex-row gap-2 items-center'>
                                            <DropdownMenuItem>
                                                <Link href="/dashboard">Dashboard</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className='w-full md:px-16 px-4 h-auto flex flex-col items-center justify-center mb-12'>
                            <div className='md:w-9/12 w-full flex flex-col items-center justify-center text-center'>
                                <Button variant={'outlineWhite'} className='md:text-lg text-base px-8 py-5 font-medium cursor-pointer md:mb-8 mb-6'>Introducing HuntHive</Button>
                                <h1 className='md:max-w-4xl w-full md:text-6xl text-3xl font-bold text-center md:mb-10 mb-6 roboto-mono'>Your Ultimate Job Tracking Platform</h1>
                                <p className='md:max-w-3xl w-11/12 md:text-xl text-base text-center text-[#777] font-normal mb-8 roboto-mono'>
                                    HuntHive is your personal job search companion, built to streamline applications, track progress, and turn chaos into clarity on your path to employment.                                </p>
                                <div className='w-auto flex md:flex-row flex-col md:gap-3 gap-4'>
                                    {authenticated && userData ? (
                                        <Link href="/dashboard">
                                            <Button variant={'outlineBlack'} className='md:text-lg text-base px-8 py-5 font-normal cursor-pointer'>Surf your dashboard</Button>
                                        </Link>
                                    ) : (
                                        <Link href="/auth/login">
                                            <Button variant={'outlineBlack'} className='md:text-lg text-base px-8 py-5 font-normal cursor-pointer'>Start now - It's free</Button>
                                        </Link>
                                    )}
                                    <Link href="/contact">
                                        <Button variant={'outlineWhite'} className='md:text-lg text-base px-8 py-5 font-normal cursor-pointer'>Schedule a demo</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className='w-full bg-[#FFC348] h-80'>
                        </div>

                    </main>
                </div>
            )}
        </React.Fragment>
    )
}

export default Index