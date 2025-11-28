"use client";

import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import Head from 'next/head';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loader from '@/components/common/Loader';
import SessionExist from '@/components/common/SessionExist';

interface studentFormData {
    name: string
    email: string
    phone: string
    type: string
    gender: string
    password: string
}

const Register = () => {
    const router = useRouter();
    const forwardurl = router.query;

    const { data: session, status: sessionStatus } = useSession();
    const [error, setError] = useState("");

    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const [isChecked, setIsChecked] = useState(true);
    const [selectedType, setSelectedType] = useState<string>("user");

    const handleCheckboxChange = (checked: boolean) => {
        setIsChecked(checked);
    };

    const handleTypeSelection = (type: string) => {
        setSelectedType(type);
        setValue("type", type);
    };

    useEffect(() => {
        if (sessionStatus === "authenticated") {
            if (forwardurl.url) {
                router.replace(`${forwardurl.url}`);
            } else {
                router.replace("/");
            }
        }
    }, [sessionStatus, router, forwardurl]);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<studentFormData>({
        defaultValues: {
            gender: "prefer-not-to-say"
        }
    });

    const selectedGender = watch("gender");

    const onSubmit: SubmitHandler<studentFormData> = async (data: any) => {
        if (!selectedType) {
            setError("Please select account type");
            return;
        }

        try {
            setLoading(true);

            const userData = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                type: selectedType,
                gender: data.gender,
            };

            const userResponse = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (userResponse.ok) {
                const res = await signIn("credentials", {
                    redirect: false,
                    email: data.email,
                    password: data.password,
                });

                if (res?.error) {
                    setError("Registration successful, but login failed. Please try logging in manually.");
                    setLoading(false);
                    if (forwardurl.url) {
                        router.push(`${forwardurl.url}`);
                    } else {
                        router.push("/");
                    }
                } else {
                    setLoading(false);
                    if (forwardurl.url) {
                        router.push(`${forwardurl.url}`);
                    } else {
                        router.push("/");
                    }
                }
            } else {
                const errorData = await userResponse.json();
                setError(errorData.message || "Registration failed");
                setLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Head>
                <link rel="icon" href="/favicon.png" type="image/png" sizes="70x70" />
                <title>Join HuntHive – Start Organizing Your Job Hunt</title>
                <meta name="description" content="Create your HuntHive account and begin managing and tracking all your job applications in one smart, organized place." />
            </Head>

            <div className="w-full fixed md:h-screen h-auto flex flex-col items-center justify-start md:overflow-hidden overflow-auto">

                {loading && <Loader />}

                {sessionStatus !== "authenticated" ? (
                    <div className="w-full flex-1 min-h-0 bg-white md:px-6 px-0 py-6">
                        <div className='bg-[#EDEBE9] w-full h-full flex flex-col items-center justify-center md:rounded-2xl rounded-none px-8 py-8 overflow-hidden'>
                            <div className="w-full flex flex-col row-start-2 items-center justify-center">

                                <div className='flex flex-col items-start lg:w-10/12 w-full h-auto'>

                                    {error && (
                                        <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-100 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <div className='w-full flex md:flex-row flex-col items-start justify-center gap-8'>
                                        <div className='lg:w-8/12 md:w-10/12 w-full flex flex-col items-center justify-center'>

                                            {/* Account Type Selection */}
                                            <div className="w-auto">

                                                <div className='flex flex-col w-full h-auto mb-4'>
                                                    <Label className='text-sm font-normal text-[#1a202c] mb-2'>
                                                        Register As
                                                        <span className='text-red-500'> *</span>
                                                    </Label>
                                                    <div className='flex gap-2 w-full'>
                                                        <Button
                                                            type='button'
                                                            onClick={() => handleTypeSelection('user')}
                                                            variant={selectedType === 'user' ? 'default' : 'outline'}
                                                            className={`flex-1 min-w-44 h-10`}
                                                        >
                                                            User
                                                        </Button>
                                                        <Button
                                                            type='button'
                                                            onClick={() => handleTypeSelection('admin')}
                                                            variant={selectedType === 'admin' ? 'default' : 'outline'}
                                                            className={`flex-1 min-w-44 h-10`}
                                                        >
                                                            Admin
                                                        </Button>
                                                    </div>
                                                    {!selectedType && (
                                                        <span className="text-sm text-red-500 mt-1">Account type is required</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Personal Information */}
                                            <div className="w-full mb-6">
                                                <h4 className="text-lg font-medium mb-3">Personal Information</h4>
                                                <Separator className="mb-4 border md:border-gray-500 border-gray-700" />

                                                {/* Name Field */}
                                                <div className='flex flex-col w-full h-auto mb-4'>
                                                    <Label htmlFor="name" className='text-sm font-normal text-[#1a202c] mb-1'>
                                                        Full Name
                                                        <span className='text-red-500'> *</span>
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        id="name"
                                                        {...register("name", {
                                                            required: "Full name is required",
                                                            maxLength: {
                                                                value: 50,
                                                                message: "Name cannot exceed 50 characters"
                                                            }
                                                        })}
                                                        placeholder='Your Full Name'
                                                        className='w-full min-h-11 h-full indent-1 bg-white'
                                                    />
                                                    {errors.name && <span className="text-sm text-red-500 mt-1">{errors.name.message}</span>}
                                                </div>

                                                <div className='w-full h-auto grid grid-cols-1 md:grid-cols-2 gap-2'>
                                                    {/* Email Field */}
                                                    <div className='flex flex-col w-full h-auto mb-4'>
                                                        <Label htmlFor="email" className='text-sm font-normal text-[#1a202c] mb-1'>
                                                            Email Address
                                                            <span className='text-red-500'> *</span>
                                                        </Label>
                                                        <Input
                                                            type="email"
                                                            id="email"
                                                            {...register("email", {
                                                                required: "Email is required",
                                                                pattern: {
                                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                    message: "Invalid email address"
                                                                }
                                                            })}
                                                            placeholder='Enter Your Email'
                                                            className='w-full h-11 indent-1 bg-white'
                                                        />
                                                        {errors.email && <span className="text-sm text-red-500 mt-1">{errors.email.message}</span>}
                                                    </div>

                                                    {/* Password Field */}
                                                    <div className='flex flex-col w-full h-auto mb-4'>
                                                        <Label htmlFor="password" className='text-sm font-normal text-[#1a202c] mb-1'>
                                                            Password
                                                            <span className='text-red-500'> *</span>
                                                        </Label>
                                                        <div className='w-full h-11 relative'>
                                                            <Input
                                                                type={showPass ? 'text' : 'password'}
                                                                id="password"
                                                                {...register("password", {
                                                                    required: "Password is required",
                                                                    minLength: {
                                                                        value: 8,
                                                                        message: "Password must be at least 8 characters"
                                                                    }
                                                                })}
                                                                placeholder='Enter Your Password'
                                                                className='w-full min-h-11 h-full indent-1 bg-white'
                                                            />
                                                            <div
                                                                onClick={() => setShowPass(!showPass)}
                                                                className='absolute inset-y-0 right-0 w-14 bg-[#efeff0] text-sm text-[#1d1d1d] font-medium flex items-center justify-center cursor-pointer m-1 rounded-r'
                                                            >
                                                                {showPass ? 'Hide' : 'Show'}
                                                            </div>
                                                        </div>
                                                        {errors.password && <span className="text-sm text-red-500 mt-1">{errors.password.message}</span>}
                                                    </div>
                                                </div>

                                                <div className='w-full h-auto grid grid-cols-1 md:grid-cols-2 gap-2'>

                                                    {/* Gender Field */}
                                                    <div className='flex flex-col w-full h-auto mb-4'>
                                                        <Label htmlFor="gender" className='text-sm font-normal text-[#1a202c] mb-1'>
                                                            Gender
                                                            <span className='text-red-500'> *</span>
                                                        </Label>
                                                        <Select
                                                            onValueChange={(value) => setValue("gender", value)}
                                                            value={selectedGender}
                                                        >
                                                            <SelectTrigger className="w-full min-h-11 h-11 bg-white">
                                                                <SelectValue placeholder="Select your gender" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="male">Male</SelectItem>
                                                                <SelectItem value="female">Female</SelectItem>
                                                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {!selectedGender && (
                                                            <span className="text-sm text-red-500 mt-1">Gender is required</span>
                                                        )}
                                                    </div>

                                                    {/* Phone Field */}
                                                    <div className='flex flex-col w-full h-auto mb-4'>
                                                        <Label htmlFor="phone" className='text-sm font-normal text-[#1a202c] mb-1'>
                                                            Phone Number
                                                            <span className='text-red-500'> *</span>
                                                        </Label>
                                                        <Input
                                                            type="tel"
                                                            id="phone"
                                                            {...register("phone", {
                                                                required: "Phone number is required",
                                                                pattern: {
                                                                    value: /^[0-9]{10}$/,
                                                                    message: "Phone number must be 10 digits"
                                                                }
                                                            })}
                                                            placeholder='Enter Your Phone Number'
                                                            className='w-full h-11 indent-1 bg-white'
                                                        />
                                                        {errors.phone && <span className="text-sm text-red-500 mt-1">{errors.phone.message}</span>}
                                                    </div>
                                                </div>

                                                <div className="flex items-start space-x-2 mb-4">
                                                    <Checkbox
                                                        id="privacyPolicyAccepted"
                                                        checked={isChecked}
                                                        onCheckedChange={handleCheckboxChange}
                                                    />
                                                    <div className="flex flex-col">
                                                        <Label
                                                            htmlFor="privacyPolicyAccepted"
                                                            className="text-sm font-normal cursor-pointer"
                                                        >
                                                            I have read and agree to the Privacy Policy of this website.
                                                            <span className='text-red-500'> *</span>
                                                        </Label>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={handleSubmit(onSubmit)}
                                                    type='button'
                                                    variant='default'
                                                    className='w-full min-h-11 mt-2'
                                                    disabled={!isChecked || !selectedType || !selectedGender}
                                                >
                                                    Register
                                                </Button>

                                                <div className='w-full text-center mt-4 flex items-center justify-center'>
                                                    <p className='text-sm text-[#1a202c] flex flex-row gap-2'>
                                                        <span className='font-medium'>Already have an account?</span>
                                                        <Link href='/auth/login' className='font-bold hover:underline cursor-pointer'>Login</Link>
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <SessionExist />
                )}

            </div>
        </React.Fragment>
    );
};

export default Register;