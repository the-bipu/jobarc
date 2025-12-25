import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/mongodb';
import { Company } from '@/models/company';

export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        const data = await request.json();

        const company = await Company.create(data);

        return NextResponse.json(company, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}