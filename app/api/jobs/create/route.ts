import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/mongodb';
import { Job } from '@/models/job';

export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        const data = await request.json();

        const job = await Job.create(data);

        return NextResponse.json(job, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}