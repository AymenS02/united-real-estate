import { ConnectDB } from '@/lib/config/db';
import PropertyModel from '@/lib/models/PropertyModel';
import { NextResponse } from 'next/server';

let dbConnected = false;

const LoadDB = async () => {
  if (!dbConnected) {
    await ConnectDB();
    dbConnected = true;
  }
};

export async function GET(request, { params }) {
  try {
    await LoadDB();
    const property = await PropertyModel.findById(params.id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property', details: error.message },
      { status: 500 }
    );
  }
}
