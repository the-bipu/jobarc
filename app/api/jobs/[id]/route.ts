import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/mongodb';
import { Job } from '@/models/job';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();
        const job = await Job.findById(params.id);

        if (!job) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json(job, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();
        const data = await request.json();

        const job = await Job.findByIdAndUpdate(params.id, data, { new: true });

        if (!job) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json(job, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();
        const job = await Job.findByIdAndDelete(params.id);

        if (!job) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Job deleted' }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}