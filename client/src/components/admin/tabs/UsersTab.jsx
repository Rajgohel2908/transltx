import React from 'react';
import Pagination from '../../Pagination';

const UsersTab = ({ allUsers, loading, handleToggleAdmin, isSubmitting, currentPage, totalPages, fetchAllData }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                {/* Placeholder for a search or filter bar */}
            </div>
            {loading ? (
                <p>Loading users...</p>
            ) : allUsers.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Admin Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 break-all">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {user.is_admin ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleAdmin(user)}
                                            disabled={isSubmitting}
                                            className={`font-bold py-2 px-4 rounded-lg text-xs text-white transition-colors disabled:opacity-50 ${user.is_admin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                        >
                                            {isSubmitting ? 'Updating...' : (user.is_admin ? 'Demote' : 'Promote')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center"><p className="text-gray-500">No users found.</p></div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchAllData(page)} />
        </div>
    );
};

export default UsersTab;
