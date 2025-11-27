"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGoogle } from "react-icons/fa";
import Head from "next/head";
import { LinkedInLogoIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import Loader from "@/components/common/Loader";
import Link from "next/link";
import SessionExist from "@/components/common/SessionExist";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

const Login = () => {
    const router = useRouter();
    const forwardurl = router.query;

    const { data: session, status: sessionStatus } = useSession();
    const [error, setError] = useState("");

    const [showPass, setShowPass] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sessionStatus === "authenticated") {
            if (forwardurl.url) {
                router.replace(`${forwardurl.url}`);
            } else {
                router.replace("/");
            }
        }
    }, [sessionStatus, router]);

    const isValidEmail = (email: string) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");

        const email = e.target[0].value;
        const password = e.target[1].value;

        if (!isValidEmail(email)) {
            toast.error("Please enter a valid email address.");
            setError("Email is invalid");
            return;
        }

        if (!password || password.length < 8) {
            toast.error("Password is invalid.");
            setError("Password is invalid");
            return;
        }

        setLoading(true);
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error === "not-registered") {
            toast.error("You’ve to register first.");
        } else if (res?.error) {
            toast.error(res?.error);
            setError("Invalid email or password");
            setLoading(false);
            if (res?.url) router.replace("/");
        } else {
            setLoading(false);
            toast.success("Logged In Succesfully!")
            if (forwardurl.url) {
                router.push(`${forwardurl.url}`);
            }
            setError("");
        }
    };

    return (
        <React.Fragment>
            <Head>
                <link rel="icon" href="/favicon.ico" type="image/ico" sizes="70x70" />
                <title>Login | Job Tracker</title>
                <meta name="description" content="Log in to your Job Tracker account or register to join the network." />
            </Head>

            <div className="w-full md:fixed relative md:h-screen h-auto flex flex-col items-center justify-start md:overflow-hidden overflow-auto">

                {loading && <Loader />}

                {sessionStatus !== "authenticated" ? (
                    <div className="w-full flex-1 min-h-0 bg-white md:px-6 px-0 md:py-6 py-0">
                        <div className='bg-[#EDEBE9] w-full h-full flex flex-col items-center justify-center md:rounded-2xl rounded-none px-8 py-8 relative overflow-hidden'>

                            <div className='absolute top-4 left-0 w-full h-auto flex flex-row items-center justify-between md:px-8 px-4 py-2'>
                                <Link href='/' className='cursor-pointer'>
                                    <Image src='/xbox.svg' alt='logo' width={200} height={80} className='w-28' />
                                </Link>
                                <Image src='/samsung.svg' alt='logo' width={200} height={80} className='w-28 cursor-pointer' />
                            </div>

                            <main className="w-full flex flex-col row-start-2 items-center justify-center md:pt-0 pt-16">

                                <div className='md:w-[600px] w-full h-full flex flex-col justify-between'>
                                    <div className='w-full text-center md:mb-14 mb-10 flex flex-col'>
                                        <p className=' text-[#27272a] md:text-3xl text-2xl font-semibold'>Enter your credentials</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className=' flex flex-col justify-center'>
                                        <Label htmlFor="email" className=' text-sm font-normal text-[#1a202c]'>
                                            Your email address
                                            <span className=' text-red-500'> *</span>
                                        </Label>
                                        <Input type="email" id="email" placeholder='variant@provider.com' className='mt-1 mb-4 placeholder:font-normal w-full min-h-11 h-full indent-1 bg-white' required />

                                        <Label htmlFor="password" className=' text-sm font-normal text-[#1a202c]'>
                                            Password
                                            <span className=' text-red-500'> *</span>
                                        </Label>
                                        <div className='mt-1 relative'>
                                            <Input type={`${showPass ? 'text' : 'password'}`} id="password" placeholder='password' className=" placeholder:font-normal w-full min-h-11 h-full indent-1 bg-white" required />
                                            <div onClick={() => setShowPass(!showPass)} className='absolute inset-y-0 right-0 w-14 bg-[#efeff0] text-sm text-[#1d1d1d] font-medium flex items-center justify-center cursor-pointer m-1 rounded-r'>{showPass ? 'Hide' : 'Show'}</div>
                                        </div>
                                        {error && (
                                            <div className="mt-2 text-sm text-red-500 text-center">
                                                {error}
                                            </div>
                                        )}

                                        <Button type='submit' variant='default' className="mt-10 min-h-11 cursor-pointer">Log in</Button>

                                    </form>

                                    <div className='relative w-full h-auto flex flex-row justify-center items-center capitalize gap-2 my-4'>
                                        <hr className='w-full border-[#0000004d] h-[1px]' />
                                        <span className=' min-w-20 px-2 text-center'> or just</span>
                                        <hr className='w-full border-[#0000004d] h-[1px]' />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant='default' className="w-full min-h-11 px-4 flex flex-row items-center justify-center gap-2 cursor-pointer">
                                                    <FaGoogle className="text-lg" />
                                                    Login with Google
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Not working as it's a little time taking process. if still want to use this, go to slietalumni.in</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant='default' className="w-full min-h-11 px-4 flex flex-row items-center justify-center gap-2 cursor-pointer">
                                                    <LinkedInLogoIcon className="w-5 h-5" />
                                                    Login with LinkedIn
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Not working as it's a little time taking process. if still want to use this, go to slietalumni.in</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <div className='w-full text-center mt-4 flex items-center justify-center'>
                                        <p className=' text-sm text-[#1a202c] flex flex-row gap-2'>
                                            <span className='font-medium'>Don't have an account!?</span>
                                            <Link href={'/auth/register'} className='font-bold hover:underline cursor-pointer'>Create One</Link>
                                        </p>
                                    </div>

                                </div>

                            </main>
                        </div>
                    </div>
                ) : (
                    <SessionExist />
                )}
            </div>

        </React.Fragment>
    );
};

export default Login;