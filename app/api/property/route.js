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

// GET → list all properties
export async function GET() {
  try {
    await LoadDB();
    const properties = await PropertyModel.find({}).lean();
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: error.message },
      { status: 500 }
    );
  }
}

// POST → create a new property listing
export async function POST(request) {
  try {
    await LoadDB();
    const jsonData = await request.json();

    console.log('Received property data:', jsonData); // Debug log

    const propertyData = {
      listingId: jsonData.listingId,
      listingType: jsonData.listingType,
      listingTypeOther: jsonData.listingTypeOther || null,

      propertyType: jsonData.propertyType,
      propertyTypeOther: jsonData.propertyTypeOther || null,
      description: jsonData.description,

      priceAmount: jsonData.priceAmount ? Number(jsonData.priceAmount) : null,
      currency: jsonData.currency,
      currencyOther: jsonData.currencyOther || null,

      area: jsonData.area ? Number(jsonData.area) : null,
      areaUnit: jsonData.areaUnit,
      areaUnitOther: jsonData.areaUnitOther || null,
      length: jsonData.length ? Number(jsonData.length) : null,
      width: jsonData.width ? Number(jsonData.width) : null,

      governorate: jsonData.governorate,
      district: jsonData.district,
      neighborhood: jsonData.neighborhood || null,
      planName: jsonData.planName || null,
      neighborUnit: jsonData.neighborUnit || null,
      plotNumber: jsonData.plotNumber || null,
      buildingNumber: jsonData.buildingNumber || null,
      apartmentNumber: jsonData.apartmentNumber || null,
      googleMapsLink: jsonData.googleMapsLink || null,

      documentTypes: jsonData.documentTypes || [],
      documentTypeOther: jsonData.documentTypeOther || null,
      documentFiles: jsonData.documentFiles || [],

      owner: {
        name: jsonData.owner?.name || null,
        phone: jsonData.owner?.phone || null
      },
      agent: {
        name: jsonData.agent?.name || null,
        phone: jsonData.agent?.phone || null
      },

      status: jsonData.status || 'Gallery'
    };

    // Basic required fields check
    if (!propertyData.listingId || !propertyData.listingType || !propertyData.propertyType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const createdProperty = await PropertyModel.create(propertyData);

    return NextResponse.json(
      {
        message: 'Property created successfully',
        property: createdProperty
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      {
        error: 'Failed to create property',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await PropertyModel.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
