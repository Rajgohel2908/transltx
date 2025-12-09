
import React from 'react';
import Pagination from '../../Pagination';

const PartnersTab = ({ allPartners, loading, handleTogglePartnerStatus, isSubmitting, currentPage, totalPages, fetchAllData, partnerFilter, setPartnerFilter }) => {

    // Filter Logic
    const filteredPartners = allPartners.filter(partner => {
        if (partnerFilter === 'All') return true;
        if (partnerFilter === 'Active') return !partner.is_frozen;
        if (partnerFilter === 'Frozen') return partner.is_frozen;
        // Case insensitive check for service type
        return partner.partnerDetails?.serviceType?.toLowerCase() === partnerFilter.toLowerCase();
    });

    const filters = ['All', 'Active', 'Frozen', 'Bus', 'Train', 'Air'];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Partner Management</h2>

                {/* Filter Buttons */}
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setPartnerFilter(filter)}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${partnerFilter === filter
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading partners...</div>
            ) : filteredPartners.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPartners.map((partner) => (
                                <tr key={partner._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{partner.partnerDetails?.companyName || partner.name}</div>
                                        <div className="text-xs text-gray-500">{partner.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{partner.partnerDetails?.contactNumber || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {partner.partnerDetails?.serviceType || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${!partner.is_frozen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {!partner.is_frozen ? 'Active' : 'Frozen'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleTogglePartnerStatus(partner)}
                                            disabled={isSubmitting}
                                            className={`font-bold py-2 px-4 rounded-lg text-xs text-white transition-colors disabled:opacity-50 ${!partner.is_frozen ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                        >
                                            {isSubmitting ? 'Updating...' : (!partner.is_frozen ? 'Freeze' : 'Activate')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-lg">No partners found matching "{partnerFilter}".</p>
                    {partnerFilter !== 'All' && (
                        <button onClick={() => setPartnerFilter('All')} className="mt-4 text-blue-600 hover:underline">
                            Clear Filter
                        </button>
                    )}
                </div>
            )}
            {/* Pagination for partners if needed, reusing Pagination component */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchAllData(page)} />
        </div>
    );
};

export default PartnersTab;
