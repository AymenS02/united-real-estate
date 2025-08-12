import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  // Listing Identifier
  listingId: { type: String, required: true }, // Unique identifier for the property

  // Listing Type
  listingType: {
    type: String,
    enum: ['Sale', 'Rent', 'Investment', 'Other'],
    required: true
  },
  listingTypeOther: { type: String }, // If "Other" is selected

  // Property Details
  propertyType: {
    type: String,
    enum: [
      'Land Plot', 'House', 'Building', 'Apartment',
      'Farm', 'Commercial Shop', 'Shopping Center', 'Other'
    ],
    required: true
  },
  propertyTypeOther: { type: String }, // If "Other" is selected
  description: { type: String, required: true },

  // Price
  priceAmount: { type: Number, required: true },
  currency: {
    type: String,
    enum: [
      'Yemeni Rial', 'Saudi Riyal', 'US Dollar',
      'UAE Dirham', 'Euro', 'Other'
    ],
    required: true
  },
  currencyOther: { type: String },

  // Area and Dimensions
  area: { type: Number, required: true },
  areaUnit: {
    type: String,
    enum: ['Square Meter', 'Linear Meter', 'Feddan', 'Hectare', 'Other'],
    required: true
  },
  areaUnitOther: { type: String },
  length: { type: Number }, // meters
  width: { type: Number },  // meters

  // Location
  governorate: { type: String, required: true },
  district: { type: String, required: true },
  neighborhood: { type: String },
  planName: { type: String },
  neighborUnit: { type: String }, // e.g., block or residential area
  plotNumber: { type: String },
  buildingNumber: { type: String },
  apartmentNumber: { type: String },
  googleMapsLink: { type: String },

  // Documents & Attachments
  documentTypes: [{
    type: String,
    enum: ['Housing', 'Grand', 'Neighborhood Elder', 'Informal', 'Other']
  }],
  documentTypeOther: { type: String },
  documentFiles: [{ type: String }], // Store file paths or URLs

  // Listing Party
  owner: {
    name: { type: String },
    phone: { type: String }
  },
  agent: {
    name: { type: String },
    phone: { type: String }
  },

  // Status
  status: {
    type: String,
    enum: ['Gallery', 'Inventory'], // Gallery = default, Inventory = moved
    default: 'Gallery'
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const PropertyModel = mongoose.models.Property || mongoose.model('Property', PropertySchema);

export default PropertyModel;
