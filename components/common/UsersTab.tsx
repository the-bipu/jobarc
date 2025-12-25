"use client";

import React, { useContext, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserContext } from '@/context/userContext';
import { toast } from 'sonner';
import { Loader2, Search, Trash2, UserCheck, Users, Mail, Phone, Edit } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface studentFormData {
    name: string
    email: string
    phone: string
    type: string
    gender: string
    password: string
}

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    type: string;
    createdAt: string;
}

const UsersTab = () => {
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isChecked, setIsChecked] = useState(true);
    const selectedType = "user";

    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    const handleCheckboxChange = (checked: boolean) => {
        setIsChecked(checked);
    };

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<studentFormData>({
        defaultValues: {
            gender: "prefer-not-to-say"
        }
    });

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        setValue: setValueEdit,
        watch: watchEdit,
        formState: { errors: errorsEdit }
    } = useForm<studentFormData>();

    const selectedGender = watch("gender");
    const selectedGenderEdit = watchEdit("gender");

    const onSubmit: SubmitHandler<studentFormData> = async (data: any) => {
        try {
            setIsCreating(true);

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
                const responseData = await userResponse.json();

                const newUser = responseData.user || responseData;

                const completeUserData: User = {
                    _id: newUser._id || newUser.id || `temp_${Date.now()}`,
                    name: newUser.name || data.name,
                    email: newUser.email || data.email,
                    phone: newUser.phone || data.phone,
                    gender: newUser.gender || data.gender,
                    type: newUser.type || selectedType,
                    createdAt: newUser.createdAt || new Date().toISOString(),
                };

                setUsers(prevUsers => [completeUserData, ...prevUsers]);

                toast.success('User created successfully!');
                reset({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    gender: 'prefer-not-to-say',
                    type: 'user'
                });

                setIsChecked(true);
                setError("");
            } else {
                const errorData = await userResponse.json();
                setError(errorData.message || "Registration failed");
                toast.error(errorData.message || "Registration failed");
            }
        } catch (error) {
            console.error('Error:', error);
            setError("An unexpected error occurred");
            toast.error("An unexpected error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    const onEditSubmit: SubmitHandler<studentFormData> = async (data: any) => {
        if (!editUser) return;

        try {
            setIsEditing(true);

            const updateData: any = {
                name: data.name,
                phone: data.phone,
                gender: data.gender,
            };

            if (data.password && data.password.trim() !== '') {
                updateData.password = data.password;
            }

            const response = await fetch(`/api/users/update?email=${editUser.email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                const updatedUser = await response.json();

                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === editUser._id ? updatedUser : user
                    )
                );

                toast.success('User updated successfully!');
                setEditUser(null);
                resetEdit();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Update failed");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsEditing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);

        try {
            const response = await fetch(`/api/users/get-users`);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteUserId) return;

        const userToDelete = users.find(user => user._id === deleteUserId);
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/users/delete?email=${userToDelete.email}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete user');

            setUsers(prevUsers => prevUsers.filter(user => user._id !== deleteUserId));

            toast.success('User deleted successfully!');
            setDeleteUserId(null);
        } catch (error) {
            toast.error('Failed to delete user');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditClick = (user: User) => {
        setEditUser(user);
        resetEdit({
            name: user.name,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            password: '',
        });
    };

    useEffect(() => {
        let filtered = [...users];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone.includes(query)
            );
        }

        if (genderFilter !== 'all') {
            filtered = filtered.filter(user => user.gender === genderFilter);
        }

        setFilteredUsers(filtered);
    }, [searchQuery, genderFilter, users]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className='p-5 w-full h-full grid md:grid-cols-2 grid-cols-1 gap-8 overflow-y-auto'>

            <div className='flex flex-col gap-4 overflow-y-auto'>
                <div className='flex flex-col gap-2'>
                    <h4 className="text-xl font-medium">Users Management</h4>
                    <p className='text-base font-light text-muted-foreground'>
                        View and manage users
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Genders</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2 ml-auto">
                            <Button
                                variant={viewMode === 'cards' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('cards')}
                            >
                                Cards
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                List
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Users className="h-16 w-16 text-muted-foreground mb-2" />
                            <h3 className="text-xl font-semibold mb-2">No users found</h3>
                            <p className="text-muted-foreground">Create your first user</p>
                        </CardContent>
                    </Card>
                ) : filteredUsers.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Search className="h-16 w-16 text-muted-foreground mb-2" />
                            <h3 className="text-xl font-semibold mb-2">No matching users found</h3>
                            <p className="text-muted-foreground">Try adjusting your search filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className={viewMode === 'cards' ? 'grid grid-cols-1 gap-4' : 'space-y-2'}>
                        {viewMode === 'cards' ? (
                            filteredUsers.map((user) => (
                                <Card key={user._id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <UserCheck className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{user.name}</CardTitle>
                                                    <CardDescription className="capitalize">
                                                        {user.gender?.replace('-', ' ') || 'N/A'}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteUserId(user._id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span>{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{user.phone}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground pt-2">
                                            Created: {formatDate(user.createdAt)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Gender</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.phone}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                                                        {user.gender.replace('-', ' ')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEditClick(user)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeleteUserId(user._id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className='bg-[#EDEBE9] w-full h-full'>
                <div className='w-full h-full flex flex-col items-center justify-center md:rounded-2xl rounded-none px-8 py-8 overflow-y-auto'>
                    <div className="w-full flex flex-col items-center justify-center">
                        <div className='flex flex-col items-start w-full h-auto'>
                            {error && (
                                <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-100 rounded">
                                    {error}
                                </div>
                            )}

                            <div className='w-full flex flex-col items-center justify-center'>
                                {/* Personal Information */}
                                <div className="w-full mb-6">
                                    <h4 className="text-lg font-medium mb-3">Create New User</h4>
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
                                            placeholder='Full Name'
                                            className='w-full min-h-11 h-full indent-1 bg-white'
                                        />
                                        {errors.name && <span className="text-sm text-red-500 mt-1">{errors.name.message}</span>}
                                    </div>

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
                                            placeholder='user@example.com'
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
                                                placeholder='Enter Password'
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
                                                <SelectValue placeholder="Select gender" />
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
                                            placeholder='Enter Phone Number'
                                            className='w-full h-11 indent-1 bg-white'
                                        />
                                        {errors.phone && <span className="text-sm text-red-500 mt-1">{errors.phone.message}</span>}
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
                                                I have read and agree to the Privacy Policy
                                                <span className='text-red-500'> *</span>
                                            </Label>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSubmit(onSubmit)}
                                        type='button'
                                        variant='default'
                                        className='w-full min-h-11 mt-2'
                                        disabled={!isChecked || !selectedGender || isCreating}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating User...
                                            </>
                                        ) : (
                                            'Create User'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information. Leave password blank to keep current password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Name Field */}
                        <div className='flex flex-col w-full'>
                            <Label htmlFor="edit-name" className='text-sm font-normal mb-1'>
                                Full Name
                                <span className='text-red-500'> *</span>
                            </Label>
                            <Input
                                type="text"
                                id="edit-name"
                                {...registerEdit("name", {
                                    required: "Full name is required",
                                    maxLength: {
                                        value: 50,
                                        message: "Name cannot exceed 50 characters"
                                    }
                                })}
                                placeholder='Full Name'
                                className='w-full'
                            />
                            {errorsEdit.name && <span className="text-sm text-red-500 mt-1">{errorsEdit.name.message}</span>}
                        </div>

                        {/* Email Field (Disabled) */}
                        <div className='flex flex-col w-full'>
                            <Label htmlFor="edit-email" className='text-sm font-normal mb-1'>
                                Email Address
                            </Label>
                            <Input
                                type="email"
                                id="edit-email"
                                {...registerEdit("email")}
                                disabled
                                className='w-full bg-muted'
                            />
                            <span className="text-xs text-muted-foreground mt-1">Email cannot be changed</span>
                        </div>

                        {/* Password Field */}
                        <div className='flex flex-col w-full'>
                            <Label htmlFor="edit-password" className='text-sm font-normal mb-1'>
                                Password (Optional)
                            </Label>
                            <Input
                                type="password"
                                id="edit-password"
                                {...registerEdit("password", {
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    }
                                })}
                                placeholder='Leave blank to keep current'
                                className='w-full'
                            />
                            {errorsEdit.password && <span className="text-sm text-red-500 mt-1">{errorsEdit.password.message}</span>}
                        </div>

                        {/* Gender Field */}
                        <div className='flex flex-col w-full'>
                            <Label htmlFor="edit-gender" className='text-sm font-normal mb-1'>
                                Gender
                                <span className='text-red-500'> *</span>
                            </Label>
                            <Select
                                onValueChange={(value) => setValueEdit("gender", value)}
                                value={selectedGenderEdit}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Phone Field */}
                        <div className='flex flex-col w-full'>
                            <Label htmlFor="edit-phone" className='text-sm font-normal mb-1'>
                                Phone Number<span className='text-red-500'> *</span>
                            </Label>
                            <Input
                                type="tel"
                                id="edit-phone"
                                {...registerEdit("phone", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Phone number must be 10 digits"
                                    }
                                })}
                                placeholder='Enter Phone Number'
                                className='w-full'
                            />
                            {errorsEdit.phone && <span className="text-sm text-red-500 mt-1">{errorsEdit.phone.message}</span>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditUser(null)}
                            disabled={isEditing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitEdit(onEditSubmit)}
                            disabled={isEditing}
                        >
                            {isEditing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update User'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this user account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default UsersTab