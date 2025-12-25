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
import Loader from "@/components/main/loader/Loader";
import Link from "next/link";
import SessionExist from "@/components/main/others/SessionExist";

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
                <link rel="icon" href="/favicon.png" type="image/png" sizes="70x70" />
                <title>Login to HuntHive – Continue Your Career Tracking</title>
                <meta name="description" content="Access your HuntHive dashboard to keep tracking job applications, stay organized, and move closer to your next career opportunity." />
            </Head>

            <div className="w-full md:fixed relative md:h-screen h-auto flex flex-col items-center justify-start md:overflow-hidden overflow-auto">

                {loading && <Loader />}

                <div className='w-full flex flex-row gap-4 text-lg font-medium items-center justify-between py-4 mb-8 md:px-16 px-4'>
                    <Link href='/' className='cursor-pointer'>
                        <Image src='/hunthive.svg' alt='logo' width={200} height={80} className='w-40' />
                    </Link>
                    <Image src='/menu.svg' alt='logo' width={200} height={80} className='w-6 cursor-pointer' />
                </div>

                {sessionStatus !== "authenticated" ? (
                    <div className="w-full min-h-0 bg-white">
                        <div className='w-full h-full flex flex-col items-center justify-center relative overflow-hidden'>

                            <main className="w-full flex flex-col row-start-2 items-center justify-center pt-12">

                                <div className='md:w-[600px] w-11/12 h-full flex flex-col justify-center'>
                                    <div className="relative w-full md:mb-14 mb-10 flex justify-center">
                                        <div className="absolute -top-1 inset-x-0 h-12 bg-[#FFC348] -skew-y-1 origin-top"></div>
                                        <div className="relative">
                                            <p className="text-[#27272a] md:text-4xl text-2xl font-semibold roboto-mono text-center">
                                                Enter your credentials
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className='flex flex-col justify-center montserrat'>
                                        <Label htmlFor="email" className='text-sm font-normal text-[#1a202c]'>
                                            Your email address
                                            <span className=' text-red-500'> *</span>
                                        </Label>
                                        <Input type="email" id="email" placeholder='variant@provider.com' className='mt-1 mb-4 placeholder:font-normal w-full min-h-11 h-full indent-1 bg-white' required />

                                        <Label htmlFor="password" className='text-sm font-normal text-[#1a202c]'>
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

                                    <div className='w-full text-center flex items-center justify-center mt-4 montserrat'>
                                        <p className=' text-sm text-[#1a202c] flex flex-row gap-2'>
                                            <span className='font-medium'>Don't have an account!?</span>
                                            <Link href={'/auth/register'} className='font-bold hover:underline cursor-pointer'>Create One</Link>
                                        </p>
                                    </div>

                                </div>

                                <div className='w-full bg-[#FFC348] h-80 md:flex hidden -skew-1'></div>
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