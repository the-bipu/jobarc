import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/mongodb';
import { Job } from '@/models/job';

export async function GET(request: NextRequest) {
    try {
        await connectMongo();
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({ message: 'email is required' }, { status: 400 });
        }

        const jobs = await Job.find({ userEmail: email }).sort({ createdAt: -1 });

        return NextResponse.json(jobs, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}