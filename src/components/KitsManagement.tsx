import { useState, useEffect } from 'react';
import { Package, Check, X, Edit, Save, Search, User, Info } from 'lucide-react';

const KitManagement = () => {
    const [kits, setKits] = useState([]);
    const [scouts, setScouts] = useState([]);
    const [filteredScouts, setFilteredScouts] = useState([]);
    const [summary, setSummary] = useState<any>(null);
    const [editingKit, setEditingKit] = useState<any>(null);
    const [selectedScout, setSelectedScout] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState<any>('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('issuance'); // 'issuance' or 'overview'

    // Fetch all data
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const production_url = `https://camp-backend-production.up.railway.app`;
            // Fetch kits
            const kitsResponse = await fetch(`${production_url}/api/kits`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!kitsResponse.ok) throw new Error('Failed to fetch kits');
            const kitsData = await kitsResponse.json();
            setKits(kitsData.kits);
            setSummary(kitsData.summary);

            // Fetch scouts
            const scoutsResponse = await fetch(`${production_url}/api/scouts`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!scoutsResponse.ok) throw new Error('Failed to fetch scouts');
            const scoutsData = await scoutsResponse.json();
            setScouts(scoutsData);
            setFilteredScouts(scoutsData);

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error loading data');
        }
    };

    // Search scouts
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredScouts(scouts);
        } else {
            const filtered = scouts.filter((scout: any) =>
                (scout.name && scout.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (scout.bsID && scout.bsID.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (scout.email && scout.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (scout.unitName && scout.unitName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredScouts(filtered);
        }
    }, [searchTerm, scouts]);

    // Update kit item status
    const updateKitItem = async (scoutId: any, item: any, received: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://camp-backend-production.up.railway.app/api/kits/scout/${scoutId}/item/${item}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ received }),
            });

            if (!response.ok) throw new Error('Failed to update kit item');

            await fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating kit item:', error);
            alert('Error updating kit item');
        }
    };

    // Save kit edits
    const saveKit = async (scoutId: any, kitData: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://camp-backend-production.up.railway.app/api/kits/scout/${scoutId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(kitData),
            });

            if (!response.ok) throw new Error('Failed to update kit');

            setEditingKit(null);
            await fetchData();
        } catch (error) {
            console.error('Error updating kit:', error);
            alert('Error updating kit');
        }
    };

    // Get kit for a scout (or create empty template)
    const getScoutKit: any = (scoutId: any) => {
        return kits.find((kit: any) => kit.scout_id === scoutId) || {
            scout_id: scoutId,
            tshirt: 0,
            scarf: 0,
            waggle: 0,
            keychain: 0,
            pen: 0,
            notes: ''
        };
    };

    useEffect(() => {
        fetchData();
    }, []);

    const kitItems = [
        { key: 'tshirt', label: 'T-Shirt' },
        { key: 'scarf', label: 'Scarf' },
        { key: 'waggle', label: 'Waggle' },
        { key: 'keychain', label: 'Keychain' },
        { key: 'pen', label: 'Pen' },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center">
                    <Package className="mr-3" size={28} />
                    Scout Kits Management
                </h1>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('issuance')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'issuance'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Kit Issuance
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Overview
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border">
                        <h3 className="font-semibold text-gray-700">Total Kits Issued</h3>
                        <p className="text-2xl font-bold text-blue-600">{summary.total_kits}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            of {scouts.length} scouts
                        </p>
                    </div>
                    {kitItems.map(item => (
                        <div key={item.key} className="bg-white p-4 rounded-lg shadow border">
                            <h3 className="font-semibold text-gray-700">{item.label}</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {summary[`${item.key}_count`]}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {Math.round((summary[`${item.key}_count`] / scouts.length) * 100)}% issued
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Kit Issuance Tab */}
            {activeTab === 'issuance' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scouts List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search scouts by name, BS ID, email, or unit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {filteredScouts.map((scout: any) => {
                                const kit = getScoutKit(scout.id);
                                const receivedItems = kitItems.filter((item: any) => kit[item.key]).length;

                                return (
                                    <div
                                        key={scout.id}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedScout?.id === scout.id ? 'bg-blue-50 border-blue-200' : ''
                                            }`}
                                        onClick={() => setSelectedScout(scout)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-gray-900">{scout.name}</h3>
                                                    {receivedItems === kitItems.length && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            Complete
                                                        </span>
                                                    )}
                                                    {receivedItems > 0 && receivedItems < kitItems.length && (
                                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                            Partial
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{scout.bsID} • {scout.unitName}</p>
                                                <p className="text-sm text-gray-500">{scout.email}</p>

                                                {/* Quick kit status */}
                                                <div className="flex space-x-1 mt-2">
                                                    {kitItems.map(item => (
                                                        <div
                                                            key={item.key}
                                                            className={`w-3 h-3 rounded-full ${kit[item.key] ? 'bg-green-500' : 'bg-gray-300'
                                                                }`}
                                                            title={`${item.label}: ${kit[item.key] ? 'Received' : 'Not Received'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className={`text-sm font-medium ${receivedItems === 0 ? 'text-red-600' :
                                                    receivedItems === kitItems.length ? 'text-green-600' : 'text-yellow-600'
                                                    }`}>
                                                    {receivedItems}/{kitItems.length} items
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedScout(scout);
                                                    }}
                                                    className="mt-1 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                >
                                                    <Info size={14} className="mr-1" />
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredScouts.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    {searchTerm ? 'No scouts found matching your search' : 'No scouts found'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kit Management for Selected Scout */}
                    <div className="bg-white rounded-lg shadow">
                        {selectedScout ? (
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {selectedScout.name}
                                        </h2>
                                        <p className="text-gray-600">{selectedScout.bsID} • {selectedScout.unitName}</p>
                                        <p className="text-gray-500 text-sm">{selectedScout.email}</p>

                                        {/* Scout Info Summary */}
                                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                            <div><strong>Phone:</strong> {selectedScout.phone || 'N/A'}</div>
                                            <div><strong>Blood Group:</strong> {selectedScout.bloodGroup || 'N/A'}</div>
                                            <div><strong>Emergency Contact:</strong> {selectedScout.emergency_contact || 'N/A'}</div>
                                            <div><strong>Registered:</strong> {new Date(selectedScout.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedScout(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Kit Items Management */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Package className="mr-2" size={20} />
                                        Kit Items
                                    </h3>

                                    <div className="space-y-3">
                                        {kitItems.map(item => {
                                            const kit = getScoutKit(selectedScout.id);
                                            const isEditing = editingKit?.scout_id === selectedScout.id;

                                            return (
                                                <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={!!editingKit[item.key]}
                                                                onChange={(e) => setEditingKit((prev: any) => ({
                                                                    ...prev,
                                                                    [item.key]: e.target.checked
                                                                }))}
                                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => updateKitItem(selectedScout.id, item.key, !kit[item.key])}
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${kit[item.key]
                                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                    }`}
                                                            >
                                                                {kit[item.key] ? <Check size={16} /> : <X size={16} />}
                                                            </button>
                                                        )}

                                                        <span className="font-medium">{item.label}</span>
                                                    </div>

                                                    <span className={`text-sm font-medium ${kit[item.key] ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {kit[item.key] ? 'Received' : 'Not Received'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Notes and Actions */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            value={editingKit?.notes || getScoutKit(selectedScout.id).notes || ''}
                                            onChange={(e) => setEditingKit((prev: any) => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))}
                                            placeholder="Add any notes about kit issuance..."
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                        {editingKit?.scout_id === selectedScout.id ? (
                                            <>
                                                <button
                                                    onClick={() => setEditingKit(null)}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => saveKit(selectedScout.id, editingKit)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                                                >
                                                    <Save size={16} className="mr-2" />
                                                    Save Changes
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setEditingKit(getScoutKit(selectedScout.id))}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                            >
                                                <Edit size={16} className="mr-2" />
                                                Edit Kit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <User size={48} className="mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Scout</h3>
                                <p>Choose a scout from the list to manage their kit items</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Scout
                                </th>
                                {kitItems.map(item => (
                                    <th key={item.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {item.label}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Issued By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {scouts.map((scout: any) => {
                                const kit = getScoutKit(scout.id);
                                const receivedItems = kitItems.filter((item: any) => kit[item.key]).length;

                                return (
                                    <tr key={scout.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {scout.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {scout.bsID} • {scout.unitName}
                                                </div>
                                            </div>
                                        </td>

                                        {kitItems.map((item: any) => (
                                            <td key={item.key} className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${kit[item.key]
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {kit[item.key] ? <Check size={14} /> : <X size={14} />}
                                                </div>
                                            </td>
                                        ))}

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${receivedItems === 0
                                                ? 'bg-red-100 text-red-800'
                                                : receivedItems === kitItems.length
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {receivedItems === 0
                                                    ? 'Not Issued'
                                                    : receivedItems === kitItems.length
                                                        ? 'Complete'
                                                        : 'Partial'
                                                }
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {kit.issued_by_name || 'Not issued'}
                                            {kit.issued_at && (
                                                <div className="text-xs text-gray-400">
                                                    {new Date(kit.issued_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedScout(scout);
                                                    setActiveTab('issuance');
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Manage Kit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default KitManagement;