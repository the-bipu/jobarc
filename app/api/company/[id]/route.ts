import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/mongodb';
import { Company } from '@/models/company';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        await connectMongo();

        const company = await Company.findById(id);

        if (!company) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(company, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        await connectMongo();

        const data = await request.json();
        const company = await Company.findByIdAndUpdate(id, data, { new: true });

        if (!company) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(company, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        await connectMongo();

        const company = await Company.findByIdAndDelete(id);

        if (!company) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Company deleted' }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}