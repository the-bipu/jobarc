"use client";

import React, { useEffect, useState } from 'react';
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
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Building2, Bookmark, BookmarkCheck } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';

const companySchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    website: z.union([z.string().url(), z.literal('')]),
    careersPage: z.union([z.string().url(), z.literal('')]),
    industry: z.string(),
    companySize: z.string(),
    headquarters: z.string(),
    hiringStatus: z.string(),
    jobOpeningsAvailable: z.boolean(),
    activePlatforms: z.array(z.string()),
    preferredJobRoles: z.string(),
    lastInteractionDate: z.string(),
    priority: z.string(),
    tags: z.string(),
    notes: z.string(),
    bookmarked: z.boolean(),
    status: z.string(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface Company extends Omit<CompanyFormValues, 'preferredJobRoles' | 'tags' | 'activePlatforms'> {
    _id: string;
    userEmail: string;
    createdAt: string;
    updatedAt: string;
    preferredJobRoles: string[];
    tags: string[];
    activePlatforms: string[];
    leads: any[];
}

const CompanyTab = ({ userData }: any) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [sizeFilter, setSizeFilter] = useState<string>('all');

    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const platformOptions = ["LinkedIn", "Indeed", "Glassdoor", "Company Website", "AngelList", "Naukri", "Other"];

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            companyName: '',
            website: '',
            careersPage: '',
            industry: '',
            companySize: '',
            headquarters: '',
            hiringStatus: 'Unknown',
            jobOpeningsAvailable: false,
            activePlatforms: [],
            preferredJobRoles: '',
            lastInteractionDate: '',
            priority: 'Medium',
            tags: '',
            notes: '',
            bookmarked: false,
            status: 'Interested',
        },
    });

    const editForm = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
    });

    useEffect(() => {
        if (userData?.email) {
            fetchCompanies();
        }
    }, [userData?.email]);

    const fetchCompanies = async () => {
        if (!userData?.email) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/company/get?email=${encodeURIComponent(userData.email)}`);
            if (!response.ok) throw new Error('Failed to fetch companies');
            const data = await response.json();
            setCompanies(data);
            setFilteredCompanies(data);
        } catch (error) {
            toast.error('Failed to load companies');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onCreateSubmit = async (values: CompanyFormValues) => {
        setIsCreating(true);

        try {
            const response = await fetch('/api/company/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    userEmail: userData?.email,
                    preferredJobRoles: values.preferredJobRoles.split(',').map(r => r.trim()).filter(Boolean),
                    tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });

            if (!response.ok) throw new Error('Failed to create company');

            const newCompany = await response.json();
            setCompanies(prevCompanies => [newCompany, ...prevCompanies]);

            toast.success('Company added successfully!');
            form.reset();
            setIsCreateDialogOpen(false);
        } catch (error) {
            toast.error('Failed to create company');
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const onEditSubmit = async (values: CompanyFormValues) => {
        if (!selectedCompany) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/company/${selectedCompany._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    preferredJobRoles: values.preferredJobRoles.split(',').map(r => r.trim()).filter(Boolean),
                    tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });

            if (!response.ok) throw new Error('Failed to update company');

            const updatedCompany = await response.json();
            setCompanies(prevCompanies =>
                prevCompanies.map(company =>
                    company._id === selectedCompany._id ? updatedCompany : company
                )
            );

            toast.success('Company updated successfully!');
            setIsEditDialogOpen(false);
            setSelectedCompany(null);
        } catch (error) {
            toast.error('Failed to update company');
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        editForm.reset({
            companyName: company.companyName,
            website: company.website,
            careersPage: company.careersPage,
            industry: company.industry,
            companySize: company.companySize,
            headquarters: company.headquarters,
            hiringStatus: company.hiringStatus,
            jobOpeningsAvailable: company.jobOpeningsAvailable,
            activePlatforms: company.activePlatforms,
            preferredJobRoles: company.preferredJobRoles.join(', '),
            lastInteractionDate: company.lastInteractionDate ? new Date(company.lastInteractionDate).toISOString().split('T')[0] : '',
            priority: company.priority,
            tags: company.tags.join(', '),
            notes: company.notes,
            bookmarked: company.bookmarked,
            status: company.status,
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteCompanyId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/company/${deleteCompanyId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete company');

            setCompanies(prevCompanies => prevCompanies.filter(company => company._id !== deleteCompanyId));

            toast.success('Company deleted successfully!');
            setDeleteCompanyId(null);
        } catch (error) {
            toast.error('Failed to delete company');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'Interested': 'bg-blue-100 text-blue-800',
            'Applied': 'bg-yellow-100 text-yellow-800',
            'In Progress': 'bg-purple-100 text-purple-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Offer Received': 'bg-green-100 text-green-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        const colors: { [key: string]: string } = {
            'Low': 'bg-gray-100 text-gray-800',
            'Medium': 'bg-blue-100 text-blue-800',
            'High': 'bg-orange-100 text-orange-800',
            'Dream': 'bg-pink-100 text-pink-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    useEffect(() => {
        let filtered = [...companies];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(company =>
                company.companyName.toLowerCase().includes(query) ||
                company.industry.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(company => company.status === statusFilter);
        }

        if (priorityFilter !== 'all') {
            filtered = filtered.filter(company => company.priority === priorityFilter);
        }

        if (sizeFilter !== 'all') {
            filtered = filtered.filter(company => company.companySize === sizeFilter);
        }

        setFilteredCompanies(filtered);
    }, [searchQuery, statusFilter, priorityFilter, sizeFilter, companies]);

    const CompanyForm = ({ form, onSubmit, isEdit = false }: { form: any; onSubmit: any; isEdit?: boolean }) => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Google" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                    <Input placeholder="Technology" {...field} />
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
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="careersPage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Careers Page</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://company.com/careers" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="companySize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Startup">Startup</SelectItem>
                                        <SelectItem value="SME">SME</SelectItem>
                                        <SelectItem value="Mid-size">Mid-size</SelectItem>
                                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="headquarters"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Headquarters</FormLabel>
                                <FormControl>
                                    <Input placeholder="San Francisco, CA" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hiringStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hiring Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Hiring">Hiring</SelectItem>
                                        <SelectItem value="Not Hiring">Not Hiring</SelectItem>
                                        <SelectItem value="Unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        <SelectItem value="Interested">Interested</SelectItem>
                                        <SelectItem value="Applied">Applied</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Offer Received">Offer Received</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Dream">Dream</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lastInteractionDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Interaction Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="preferredJobRoles"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred Job Roles</FormLabel>
                                <FormControl>
                                    <Input placeholder="Software Engineer, Data Scientist" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <Input placeholder="remote, ai, startup" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="activePlatforms"
                    render={() => (
                        <FormItem>
                            <FormLabel>Active Platforms</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {platformOptions.map((platform) => (
                                    <FormField
                                        key={platform}
                                        control={form.control}
                                        name="activePlatforms"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(platform)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, platform])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value: any) => value !== platform
                                                                    )
                                                                );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal cursor-pointer">
                                                    {platform}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="jobOpeningsAvailable"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                                Job Openings Available
                            </FormLabel>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bookmarked"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                                Bookmarked
                            </FormLabel>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional notes about this company..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isEdit ? isUpdating : isCreating}>
                    {isEdit ? (
                        isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Company'
                    ) : (
                        isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Company'
                    )}
                </Button>
            </form>
        </Form>
    );

    if (loading && companies.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-5 overflow-y-auto h-full">
            <div className='w-full flex flex-col gap-5'>
                <div className='w-full flex md:flex-row flex-col md:items-center items-start gap-3 justify-between'>
                    <div className='flex flex-col'>
                        <h4 className="text-xl font-medium">Companies</h4>
                        <div className='text-base font-light'>Track companies you're interested in</div>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4" />
                                Add New Company
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add Company</DialogTitle>
                                <DialogDescription>
                                    Add a new company to track
                                </DialogDescription>
                            </DialogHeader>
                            <CompanyForm form={form} onSubmit={onCreateSubmit} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative flex-1 max-w-md">
                            <Input
                                type="text"
                                placeholder="Search by company or industry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-4"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Interested">Interested</SelectItem>
                                <SelectItem value="Applied">Applied</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Offer Received">Offer Received</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Dream">Dream</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sizeFilter} onValueChange={setSizeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sizes</SelectItem>
                                <SelectItem value="Startup">Startup</SelectItem>
                                <SelectItem value="SME">SME</SelectItem>
                                <SelectItem value="Mid-size">Mid-size</SelectItem>
                                <SelectItem value="Enterprise">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="container mx-auto space-y-6">
                        {companies.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Building2 className="h-16 w-16 text-muted-foreground mb-2" />
                                    <h3 className="text-xl font-semibold mb-2">No companies yet</h3>
                                    <p className="text-muted-foreground mb-5">Start tracking companies you're interested in</p>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Company
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : filteredCompanies.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Building2 className="h-16 w-16 text-muted-foreground mb-2" />
                                    <h3 className="text-xl font-semibold mb-2">No matching companies found</h3>
                                    <p className="text-muted-foreground mb-5">Try adjusting your search terms</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Industry</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Size</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Hiring</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredCompanies.map((company) => (
                                                <tr key={company._id} className="transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{company.companyName}</span>
                                                            {company.bookmarked && (
                                                                <BookmarkCheck className="h-4 w-4 text-yellow-600" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{company.industry || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                                                            {company.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(company.priority)}`}>
                                                            {company.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{company.companySize || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{company.hiringStatus}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{company.headquarters || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className='cursor-pointer'
                                                                onClick={() => handleEdit(company)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className='cursor-pointer'
                                                                onClick={() => setDeleteCompanyId(company._id)}
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
                                    <DialogTitle>Edit Company</DialogTitle>
                                    <DialogDescription>
                                        Update company details
                                    </DialogDescription>
                                </DialogHeader>
                                <CompanyForm form={editForm} onSubmit={onEditSubmit} isEdit />
                            </DialogContent>
                        </Dialog>

                        <AlertDialog open={!!deleteCompanyId} onOpenChange={() => setDeleteCompanyId(null)}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this company.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyTab;