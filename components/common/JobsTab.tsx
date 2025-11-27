"use client";

import { UserContext } from '@/context/userContext';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
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
import { BackpackIcon } from '@radix-ui/react-icons';

const jobSchema = z.object({
    company: z.string().min(1),
    position: z.string().min(1),
    applicationDate: z.string(),
    status: z.string(),
    salary: z.string(),
    jobType: z.string(),
    jobLocation: z.string(),
    reference: z.string(),
    website: z.union([z.string().url(), z.literal('')]),
    applicationSource: z.string(),
    notes: z.string(),
    resumeVersion: z.string(),
    followUpDate: z.string(),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface Job extends JobFormValues {
    _id: string;
    userEmail: string;
    createdAt: string;
    updatedAt: string;
}

const JobsTab = ({ userData }: any) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            company: '',
            position: '',
            status: 'Applied',
            salary: '',
            jobType: 'Full-time',
            jobLocation: '',
            reference: '',
            website: '',
            applicationSource: 'Company Website',
            notes: '',
            resumeVersion: '',
        },
    });

    const editForm = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
    });

    useEffect(() => {
        if (userData?.email) {
            fetchJobs();
        }
    }, [userData?.email]);

    const fetchJobs = async () => {
        if (!userData?.email) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/jobs/get?email=${encodeURIComponent(userData.email)}`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();
            setJobs(data);
            setFilteredJobs(data);
        } catch (error) {
            toast.error('Failed to load jobs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onCreateSubmit = async (values: JobFormValues) => {
        try {
            const response = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    userEmail: userData?.email,
                }),
            });

            if (!response.ok) throw new Error('Failed to create job');

            toast.success('Job application added successfully!');
            form.reset();
            setIsCreateDialogOpen(false);
            fetchJobs();
        } catch (error) {
            toast.error('Failed to create job application');
            console.error(error);
        }
    };

    const onEditSubmit = async (values: JobFormValues) => {
        if (!selectedJob) return;

        try {
            const response = await fetch(`/api/jobs/${selectedJob._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) throw new Error('Failed to update job');

            toast.success('Job application updated successfully!');
            setIsEditDialogOpen(false);
            setSelectedJob(null);
            fetchJobs();
        } catch (error) {
            toast.error('Failed to update job application');
            console.error(error);
        }
    };

    const handleEdit = (job: Job) => {
        setSelectedJob(job);
        editForm.reset({
            company: job.company,
            position: job.position,
            applicationDate: job.applicationDate ? new Date(job.applicationDate).toISOString().split('T')[0] : '',
            status: job.status,
            salary: job.salary,
            jobType: job.jobType,
            jobLocation: job.jobLocation,
            reference: job.reference,
            website: job.website,
            applicationSource: job.applicationSource,
            notes: job.notes,
            resumeVersion: job.resumeVersion,
            followUpDate: job.followUpDate ? new Date(job.followUpDate).toISOString().split('T')[0] : '',
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteJobId) return;

        try {
            const response = await fetch(`/api/jobs/${deleteJobId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete job');

            toast.success('Job application deleted successfully!');
            setDeleteJobId(null);
            fetchJobs();
        } catch (error) {
            toast.error('Failed to delete job application');
            console.error(error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'Applied': 'bg-blue-100 text-blue-800',
            'HR Screening': 'bg-yellow-100 text-yellow-800',
            'Interview Scheduled': 'bg-purple-100 text-purple-800',
            'Technical Round': 'bg-indigo-100 text-indigo-800',
            'Managerial Round': 'bg-pink-100 text-pink-800',
            'Offered': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Ghosted': 'bg-gray-100 text-gray-800',
            'Accepted': 'bg-emerald-100 text-emerald-800',
            'Joined': 'bg-teal-100 text-teal-800',
            'Withdrawn': 'bg-orange-100 text-orange-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredJobs(jobs);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = jobs.filter(job =>
            job.company.toLowerCase().includes(query) ||
            job.position.toLowerCase().includes(query)
        );
        setFilteredJobs(filtered);
    }, [searchQuery, jobs]);

    const JobForm = ({ form, onSubmit, isEdit = false }: { form: any; onSubmit: any; isEdit?: boolean }) => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Google" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Position *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Applied">Applied</SelectItem>
                                        <SelectItem value="HR Screening">HR Screening</SelectItem>
                                        <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                                        <SelectItem value="Technical Round">Technical Round</SelectItem>
                                        <SelectItem value="Managerial Round">Managerial Round</SelectItem>
                                        <SelectItem value="Offered">Offered</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Ghosted">Ghosted</SelectItem>
                                        <SelectItem value="Accepted">Accepted</SelectItem>
                                        <SelectItem value="Joined">Joined</SelectItem>
                                        <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="jobType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Select job type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Remote">Remote</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Salary</FormLabel>
                                <FormControl>
                                    <Input placeholder="$80,000 - $120,000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="jobLocation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="San Francisco, CA" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="applicationSource"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Application Source</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Campus">Campus</SelectItem>
                                        <SelectItem value="Referral">Referral</SelectItem>
                                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                        <SelectItem value="Indeed">Indeed</SelectItem>
                                        <SelectItem value="Company Website">Company Website</SelectItem>
                                        <SelectItem value="HR Email">HR Email</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Posting URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://company.com/careers" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="resumeVersion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resume Version</FormLabel>
                                <FormControl>
                                    <Input placeholder="v1.2" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="applicationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Application Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="followUpDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Follow-up Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional notes about this application..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    {isEdit ? 'Update Job Application' : 'Create Job Application'}
                </Button>
            </form>
        </Form>
    );

    if (loading && jobs.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-5">
            <div className='w-full flex flex-col gap-5'>
                <div className='w-full flex md:flex-row flex-col md:items-center items-start gap-3 justify-between'>
                    <div className='flex flex-col'>
                        <h4 className="text-xl font-medium">Jobs Information</h4>
                        <div className='text-base font-light'>View your jobs details</div>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4" />
                                Add New Application
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Job Application</DialogTitle>
                                <DialogDescription>
                                    Add a new job application to track your progress
                                </DialogDescription>
                            </DialogHeader>
                            <JobForm form={form} onSubmit={onCreateSubmit} />
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Input
                                type="text"
                                placeholder="Search by company or position..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-4"
                            />
                        </div>
                    </div>

                    <div className="container mx-auto space-y-6">
                        {jobs.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <BackpackIcon className="h-16 w-16 text-muted-foreground mb-2" />
                                    <h3 className="text-xl font-semibold mb-2">No job applications yet</h3>
                                    <p className="text-muted-foreground mb-5">Start tracking your job search journey</p>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Application
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : filteredJobs.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <BackpackIcon className="h-16 w-16 text-muted-foreground mb-2" />
                                    <h3 className="text-xl font-semibold mb-2">No matching applications found</h3>
                                    <p className="text-muted-foreground mb-5">Try adjusting your search terms</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Position</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Salary</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Applied Date</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredJobs.map((job) => (
                                                <tr key={job._id} className="transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium">{job.position}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.company}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.jobLocation || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.jobType || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.salary || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.applicationSource || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {formatDate(job.applicationDate || job.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className='cursor-pointer'
                                                                onClick={() => handleEdit(job)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className='cursor-pointer'
                                                                onClick={() => setDeleteJobId(job._id)}
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

                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Edit Job Application</DialogTitle>
                                    <DialogDescription>
                                        Update your job application details
                                    </DialogDescription>
                                </DialogHeader>
                                <JobForm form={editForm} onSubmit={onEditSubmit} isEdit />
                            </DialogContent>
                        </Dialog>

                        <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this job application.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobsTab