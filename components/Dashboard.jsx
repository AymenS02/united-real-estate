'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Move,
  Trash2,
  Loader2
} from 'lucide-react';

/**
 * Dashboard with full form fields for the RealEstate schema.
 *
 * Notes:
 * - File upload here only sends file names (you must implement server storage / upload separately).
 * - API path is '/api/property' to match your server error trace; change if your route is different.
 */

const GOVERNORATE_DISTRICTS = {
  Aden: [
    'Sirah', 'Khormaksar', 'Al-Mualla', 'Al-Tawahi',
    'Sheikh Othman', 'Al-Mansoura', 'Dar Saad', 'Al-Buraiqa', 'Other'
  ],
  Lahj: [
    'Al-Hadd', 'Al-Houta', 'Al-Qubaytah', 'Al-Musaymir',
    'Al-Mudarabah and Al-Arah', 'Al-Muflahi', 'Al-Maqatirah',
    'Al-Malah', 'Tuban', 'Halmin', 'Jubail Jabr', 'Radfan',
    'Tur Al-Bahah', 'Yafa', 'Yahr', 'Other'
  ],
  Abyan: [
    'Zinjibar', 'Al-Mahfad', 'Mudiyah', 'Jayshan',
    'Lawdar', 'Sibah', 'Rasad', 'Sarar', 'Ahwar',
    'Khanfar', 'Al-Wadiah', 'Other'
  ],
  // Add other governorates as needed (strings)
};

const GOVERNORATES = [
  'Aden', 'Lahj', 'Abyan', 'Shabwah', 'Al-Dhalea',
  'Hadhramaut', 'Al-Mahra', 'Socotra', 'Other'
];

const PROPERTY_TYPES = [
  'Land Plot', 'House', 'Building', 'Apartment',
  'Farm', 'Commercial Shop', 'Shopping Center', 'Other'
];

const LISTING_TYPES = ['Sale', 'Rent', 'Investment', 'Other'];

const CURRENCIES = [
  'Yemeni Rial', 'Saudi Riyal', 'US Dollar',
  'UAE Dirham', 'Euro', 'Other'
];

const AREA_UNITS = ['Square Meter', 'Linear Meter', 'Feddan', 'Hectare', 'Other'];

const DOCUMENT_TYPES = ['Housing', 'Grand', 'Neighborhood Elder', 'Informal', 'Other'];

const initialListing = {
  listingId: '',
  listingType: 'Sale',
  listingTypeOther: '',
  propertyType: 'House',
  propertyTypeOther: '',
  description: '',
  priceAmount: '',
  currency: 'US Dollar',
  currencyOther: '',
  area: '',
  areaUnit: 'Square Meter',
  areaUnitOther: '',
  length: '', // meters
  width: '', // meters
  governorate: '',
  governorateOther: '',
  district: '',
  districtOther: '',
  neighborhood: '',
  planName: '',
  neighborUnit: '',
  plotNumber: '',
  buildingNumber: '',
  apartmentNumber: '',
  googleMapsLink: '',
  documentTypes: [], // array of strings
  documentTypeOther: '',
  documentFiles: [], // array of file names (client side)
  owner: { name: '', phone: '' },
  agent: { name: '', phone: '' },
  status: 'Gallery'
};

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [newListing, setNewListing] = useState(initialListing);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch existing listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/property');
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Handle governorate change: update district options
  const handleGovernorateChange = (value) => {
    let districts = [];
    if (GOVERNORATE_DISTRICTS[value]) {
      districts = GOVERNORATE_DISTRICTS[value];
    }
    setAvailableDistricts(districts);
    setNewListing({
      ...newListing,
      governorate: value,
      district: '',
      governorateOther: value === 'Other' ? newListing.governorateOther : ''
    });
  };

  // Toggle document type checkbox
  const toggleDocumentType = (type) => {
    const arr = Array.from(newListing.documentTypes || []);
    const idx = arr.indexOf(type);
    if (idx === -1) arr.push(type);
    else arr.splice(idx, 1);
    setNewListing({ ...newListing, documentTypes: arr });
  };

  // Handle file selection (client-side only: send filenames)
  const handleFileChange = (filesList) => {
    const files = Array.from(filesList || []);
    const fileNames = files.map((f) => f.name);
    setNewListing({ ...newListing, documentFiles: fileNames });
  };

  // Client-side validation
  const validate = () => {
    const e = {};
    if (!newListing.listingId) e.listingId = 'Listing ID is required';
    if (!newListing.listingType) e.listingType = 'Listing type required';
    if (newListing.listingType === 'Other' && !newListing.listingTypeOther) e.listingTypeOther = 'Specify other listing type';
    if (!newListing.propertyType) e.propertyType = 'Property type required';
    if (newListing.propertyType === 'Other' && !newListing.propertyTypeOther) e.propertyTypeOther = 'Specify other property type';
    if (!newListing.description) e.description = 'Description required';
    if (!newListing.priceAmount && newListing.priceAmount !== 0) e.priceAmount = 'Price is required';
    if (!newListing.currency) e.currency = 'Currency required';
    if (newListing.currency === 'Other' && !newListing.currencyOther) e.currencyOther = 'Specify other currency';
    if (!newListing.area && newListing.area !== 0) e.area = 'Area is required';
    if (!newListing.areaUnit) e.areaUnit = 'Area unit required';
    if (newListing.areaUnit === 'Other' && !newListing.areaUnitOther) e.areaUnitOther = 'Specify other area unit';
    if (!newListing.governorate) e.governorate = 'Governorate required';
    if (newListing.governorate === 'Other' && !newListing.governorateOther) e.governorateOther = 'Specify other governorate';
    if (!newListing.district) e.district = 'District required';
    return e;
  };

  // Create listing
  const createListing = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    try {
      setLoading(true);

      // Prepare payload with numbers and nested fields
      const payload = {
        listingId: newListing.listingId,
        listingType: newListing.listingType,
        listingTypeOther: newListing.listingType === 'Other' ? newListing.listingTypeOther : null,

        propertyType: newListing.propertyType,
        propertyTypeOther: newListing.propertyType === 'Other' ? newListing.propertyTypeOther : null,
        description: newListing.description,

        priceAmount: Number(newListing.priceAmount),
        currency: newListing.currency,
        currencyOther: newListing.currency === 'Other' ? newListing.currencyOther : null,

        area: Number(newListing.area),
        areaUnit: newListing.areaUnit,
        areaUnitOther: newListing.areaUnit === 'Other' ? newListing.areaUnitOther : null,
        length: newListing.length ? Number(newListing.length) : null,
        width: newListing.width ? Number(newListing.width) : null,

        governorate: newListing.governorate === 'Other' ? newListing.governorateOther : newListing.governorate,
        district: newListing.district === 'Other' ? newListing.districtOther : newListing.district,
        neighborhood: newListing.neighborhood,
        planName: newListing.planName,
        neighborUnit: newListing.neighborUnit,
        plotNumber: newListing.plotNumber,
        buildingNumber: newListing.buildingNumber,
        apartmentNumber: newListing.apartmentNumber,
        googleMapsLink: newListing.googleMapsLink,

        documentTypes: newListing.documentTypes,
        documentTypeOther: newListing.documentTypes.includes('Other') ? newListing.documentTypeOther : null,
        documentFiles: newListing.documentFiles, // filenames; implement real upload on server

        owner: { name: newListing.owner.name, phone: newListing.owner.phone },
        agent: { name: newListing.agent.name, phone: newListing.agent.phone },

        status: newListing.status || 'Gallery'
      };

      const res = await fetch('/api/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Server error creating property:', data);
        alert(data.error || 'Failed to create listing; check console for server errors.');
      } else {
        // reset form and refresh list
        setNewListing(initialListing);
        setAvailableDistricts([]);
        setFormOpen(false);
        fetchListings();
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      alert('Failed to create listing; check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Move to Inventory (PATCH)
  const moveToInventory = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/property/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Inventory' })
      });
      if (res.ok) fetchListings();
      else {
        const err = await res.json();
        console.error('Move to inventory failed:', err);
        alert(err.error || 'Failed to move listing');
      }
    } catch (err) {
      console.error('Error moving to inventory:', err);
      alert('Failed to move listing; check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Delete listing
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const res = await fetch('/api/property', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        // ✅ Remove from state so it disappears instantly
        setListings((prev) => prev.filter((p) => p._id !== id));
      } else {
        console.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Real Estate Dashboard</h2>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          <Plus size={16} /> {formOpen ? 'Close Form' : 'Add Listing'}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={createListing}
          className="bg-gray-800 p-6 rounded mb-6 grid gap-4"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Listing ID *</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.listingId}
                onChange={(e) => setNewListing({ ...newListing, listingId: e.target.value })}
              />
              {errors.listingId && <div className="text-xs text-red-400">{errors.listingId}</div>}
            </div>

            <div>
              <label className="block text-sm text-gray-300">Listing Type *</label>
              <select
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.listingType}
                onChange={(e) => setNewListing({ ...newListing, listingType: e.target.value })}
              >
                {LISTING_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {newListing.listingType === 'Other' && (
                <input
                  placeholder="Specify other listing type"
                  className="w-full mt-2 p-2 rounded bg-gray-700"
                  value={newListing.listingTypeOther}
                  onChange={(e) => setNewListing({ ...newListing, listingTypeOther: e.target.value })}
                />
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-300">Property Type *</label>
              <select
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.propertyType}
                onChange={(e) => setNewListing({ ...newListing, propertyType: e.target.value })}
              >
                {PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}
              </select>
              {newListing.propertyType === 'Other' && (
                <input
                  placeholder="Specify other property type"
                  className="w-full mt-2 p-2 rounded bg-gray-700"
                  value={newListing.propertyTypeOther}
                  onChange={(e) => setNewListing({ ...newListing, propertyTypeOther: e.target.value })}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300">Description *</label>
            <textarea
              className="w-full p-2 rounded bg-gray-700"
              value={newListing.description}
              onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
            />
            {errors.description && <div className="text-xs text-red-400">{errors.description}</div>}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Price (numbers only) *</label>
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.priceAmount}
                onChange={(e) => setNewListing({ ...newListing, priceAmount: e.target.value })}
              />
              {errors.priceAmount && <div className="text-xs text-red-400">{errors.priceAmount}</div>}
            </div>

            <div>
              <label className="block text-sm text-gray-300">Currency *</label>
              <select
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.currency}
                onChange={(e) => setNewListing({ ...newListing, currency: e.target.value })}
              >
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {newListing.currency === 'Other' && (
                <input
                  placeholder="Specify currency"
                  className="w-full mt-2 p-2 rounded bg-gray-700"
                  value={newListing.currencyOther}
                  onChange={(e) => setNewListing({ ...newListing, currencyOther: e.target.value })}
                />
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-300">Area *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-1/2 p-2 rounded bg-gray-700"
                  value={newListing.area}
                  onChange={(e) => setNewListing({ ...newListing, area: e.target.value })}
                />
                <select
                  className="w-1/2 p-2 rounded bg-gray-700"
                  value={newListing.areaUnit}
                  onChange={(e) => setNewListing({ ...newListing, areaUnit: e.target.value })}
                >
                  {AREA_UNITS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              {newListing.areaUnit === 'Other' && (
                <input
                  placeholder="Specify area unit"
                  className="w-full mt-2 p-2 rounded bg-gray-700"
                  value={newListing.areaUnitOther}
                  onChange={(e) => setNewListing({ ...newListing, areaUnitOther: e.target.value })}
                />
              )}
              {errors.area && <div className="text-xs text-red-400">{errors.area}</div>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Length (meters)</label>
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.length}
                onChange={(e) => setNewListing({ ...newListing, length: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Width (meters)</label>
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.width}
                onChange={(e) => setNewListing({ ...newListing, width: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Google Maps link</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.googleMapsLink}
                onChange={(e) => setNewListing({ ...newListing, googleMapsLink: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Governorate *</label>
              <select
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.governorate}
                onChange={(e) => handleGovernorateChange(e.target.value)}
              >
                <option value="">-- Select Governorate --</option>
                {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {newListing.governorate === 'Other' && (
                <input
                  placeholder="Specify governorate"
                  className="w-full mt-2 p-2 rounded bg-gray-700"
                  value={newListing.governorateOther}
                  onChange={(e) => setNewListing({ ...newListing, governorateOther: e.target.value })}
                />
              )}
              {errors.governorate && <div className="text-xs text-red-400">{errors.governorate}</div>}
            </div>

            <div>
              <label className="block text-sm text-gray-300">District *</label>
              <select
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.district}
                onChange={(e) => setNewListing({ ...newListing, district: e.target.value })}
              >
                <option value="">-- Select District --</option>
                {availableDistricts.length > 0
                  ? availableDistricts.map(d => <option key={d} value={d}>{d}</option>)
                  : <option value="Other">Other</option>
                }
              </select>
              {newListing.district === 'Other' && (
                <input
                  placeholder="Specify district"
                  className="w-full mt-2 p-2 rounded bg-gray-700"
                  value={newListing.districtOther}
                  onChange={(e) => setNewListing({ ...newListing, districtOther: e.target.value })}
                />
              )}
              {errors.district && <div className="text-xs text-red-400">{errors.district}</div>}
            </div>

            <div>
              <label className="block text-sm text-gray-300">Neighborhood / Area</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.neighborhood}
                onChange={(e) => setNewListing({ ...newListing, neighborhood: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Plan Name</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.planName}
                onChange={(e) => setNewListing({ ...newListing, planName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Neighbor Unit (block, etc.)</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.neighborUnit}
                onChange={(e) => setNewListing({ ...newListing, neighborUnit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Plot / Building / Apt #</label>
              <div className="flex gap-2">
                <input
                  placeholder="Plot #"
                  className="w-1/3 p-2 rounded bg-gray-700"
                  value={newListing.plotNumber}
                  onChange={(e) => setNewListing({ ...newListing, plotNumber: e.target.value })}
                />
                <input
                  placeholder="Building #"
                  className="w-1/3 p-2 rounded bg-gray-700"
                  value={newListing.buildingNumber}
                  onChange={(e) => setNewListing({ ...newListing, buildingNumber: e.target.value })}
                />
                <input
                  placeholder="Apt #"
                  className="w-1/3 p-2 rounded bg-gray-700"
                  value={newListing.apartmentNumber}
                  onChange={(e) => setNewListing({ ...newListing, apartmentNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300">Document Types (multi-select)</label>
            <div className="flex gap-3 flex-wrap mt-2">
              {DOCUMENT_TYPES.map((dt) => (
                <label key={dt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newListing.documentTypes.includes(dt)}
                    onChange={() => toggleDocumentType(dt)}
                    className="rounded"
                  />
                  <span className="text-sm">{dt}</span>
                </label>
              ))}
            </div>
            {newListing.documentTypes.includes('Other') && (
              <input
                placeholder="Specify other document type"
                className="w-full mt-2 p-2 rounded bg-gray-700"
                value={newListing.documentTypeOther}
                onChange={(e) => setNewListing({ ...newListing, documentTypeOther: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300">Document files (select multiple files, client sends filenames)</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e.target.files)}
              className="mt-2"
            />
            {newListing.documentFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-300">
                Selected files: {newListing.documentFiles.join(', ')}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Owner Name</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.owner.name}
                onChange={(e) => setNewListing({ ...newListing, owner: { ...newListing.owner, name: e.target.value } })}
              />
              <label className="block text-sm text-gray-300 mt-2">Owner Phone</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.owner.phone}
                onChange={(e) => setNewListing({ ...newListing, owner: { ...newListing.owner, phone: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Agent Name</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.agent.name}
                onChange={(e) => setNewListing({ ...newListing, agent: { ...newListing.agent, name: e.target.value } })}
              />
              <label className="block text-sm text-gray-300 mt-2">Agent Phone</label>
              <input
                className="w-full p-2 rounded bg-gray-700"
                value={newListing.agent.phone}
                onChange={(e) => setNewListing({ ...newListing, agent: { ...newListing.agent, phone: e.target.value } })}
              />
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Listing'}
            </button>
            <button
              type="button"
              onClick={() => { setNewListing(initialListing); setErrors({}); }}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* Listings Table */}
      <div className="bg-gray-800 rounded overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">
            <Loader2 className="animate-spin mx-auto" size={24} />
          </div>
        ) : listings.length > 0 ? (
          <table className="w-full text-sm table-auto">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-2 text-left">Listing ID</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Property</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Area</th>
                <th className="p-2 text-left">Location</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id} className="border-b border-gray-700">
                  <td className="p-2">{listing.listingId}</td>
                  <td className="p-2">{listing.listingType}{listing.listingTypeOther ? ` (${listing.listingTypeOther})` : ''}</td>
                  <td className="p-2">{listing.propertyType}{listing.propertyTypeOther ? ` (${listing.propertyTypeOther})` : ''}</td>
                  <td className="p-2">{listing.priceAmount} {listing.currency}{listing.currencyOther ? ` (${listing.currencyOther})` : ''}</td>
                  <td className="p-2">{listing.area} {listing.areaUnit}</td>
                  <td className="p-2">{listing.governorate} / {listing.district}</td>
                  <td className="p-2">{listing.status}</td>
                  <td className="p-2 flex gap-2">
                    {listing.status === 'Gallery' && (
                      <button
                        onClick={() => moveToInventory(listing._id)}
                        className="bg-yellow-600 px-2 py-1 rounded hover:bg-yellow-700 flex items-center gap-1"
                      >
                        <Move size={14} /> Inventory
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400">No listings found.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
