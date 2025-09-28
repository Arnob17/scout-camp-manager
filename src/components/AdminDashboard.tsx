import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, UserPlus, Utensils, CheckCircle, XCircle, Search, X, AlertTriangle, Trash2, Edit, Save } from 'lucide-react';
import KitManagement from './KitsManagement';
interface Scout {
  id: number;
  email: string;
  bsID: string;         // ⚠️ only include if needed internally (e.g. for login), not for public API
  unitName: string;
  password: string;
  name: string;
  name_bangla: string;
  age: number;                // or string if you're storing date — adjust accordingly
  fatherName: string;
  motherName: string;
  address: string;
  bloodGroup: string;
  phone: string;
  emergency_contact: string | null;
  payment_amount: string;
  image_url: string | null;
  scout_type: string;
  registered_by: number | null;
  created_at: string;
}


interface CampInfo {
  id: number;
  camp_name: string;
  camp_date: string;
  location: string;
  description: string;
  max_participants: number;
}

interface FoodEntry {
  id: number;
  scout_id: number;
  scout_name: string;
  food_name: string;
  food_time: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_date: string;
  received: boolean;
  created_at: string;
}

interface AdminDashboardProps {
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [campInfo, setCampInfo] = useState<CampInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'scouts' | 'register' | 'settings' | 'food' | 'kits'>('scouts');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // New scout form state
  const [newScout, setNewScout] = useState({
    name: '',
    name_bangla: '',
    bsID: '',
    email: '',
    unitName: '',
    fatherName: '',
    motherName: '',
    address: '',
    bloodGroup: '',
    password: '',
    age: '',
    phone: '',
    emergency_contact: '',
    paymentAmount: "",
    image_url: '',
    scout_type: 'scout' // Default value
  });

  // Camp settings form state
  const [campSettings, setCampSettings] = useState({
    camp_name: '',
    camp_date: '',
    location: '',
    description: '',
    max_participants: ''
  });

  // Food management state
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newFoodEntry, setNewFoodEntry] = useState({
    scoutId: '',
    food_name: '',
    food_time: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    food_date: new Date().toISOString().split('T')[0],
    received: false
  });

  // Scout search state
  const [showScoutSearch, setShowScoutSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredScouts, setFilteredScouts] = useState<Scout[]>([]);

  const production_url = `https://camp-backend-production.up.railway.app`;
  // const production_url = `http://localhost:3001`;
  // Scout types
  const scoutTypes = [
    { value: 'cub', label: 'Cub Scout' },
    { value: 'scout', label: 'Scout' },
    { value: 'rover', label: 'Rover' },
    { value: 'venturer', label: 'Parents' },
    { value: 'leader', label: 'Leader' },
    { value: 'officials', label: 'Officials' },
    { value: 'volunteer', label: 'Volunteer' }
  ];

  const bloodTypes = [
    { value: 'a+', label: 'A+' },
    { value: 'b+', label: 'B+' },
    { value: 'ab+', label: 'AB+' },
    { value: 'o+', label: 'O+' },
    { value: 'a-', label: 'A-' },
    { value: 'b-', label: 'B-' },
    { value: 'o-', label: 'O-' },
    { value: 'ab-', label: 'AB-' },
  ];

  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);

  const openModal = (scout: Scout) => setSelectedScout(scout);
  const closeModal = () => setSelectedScout(null);

  const [deleteConfirm, setDeleteConfirm] = useState<Scout | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editScout, setEditScout] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchScouts();
    fetchCampInfo();
    fetchFoodEntries();
  }, [selectedDate]);

  const fetchScouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/scouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setScouts(data);
      }
    } catch (error) {
      console.error('Error fetching scouts:', error);
    }
  };


  const updateScout = async (scoutId: any, updateData: any) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/scouts/${scoutId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update scout');
      }

      const result = await response.json();

      // Update local state
      setScouts(prevScouts =>
        prevScouts.map(scout =>
          scout.id === scoutId ? result.scout : scout
        )
      );

      // Close edit modal and refresh selected scout
      setEditScout(null);
      setSelectedScout(result.scout);

      return result;
    } catch (error) {
      console.error('Error updating scout:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteScout = async (scoutId: any) => {
    if (!scoutId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/scouts/${scoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete scout');
      }

      // Remove the scout from the local state
      setScouts(prevScouts => prevScouts.filter(scout => scout.id !== scoutId));

      // Close both modals
      setSelectedScout(null);
      setDeleteConfirm(null);

      // Show success message
      alert('Scout deleted successfully!');

    } catch (error: any) {
      console.error('Error deleting scout:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };


  const fetchCampInfo = async () => {
    try {
      const response = await fetch(`${production_url}/api/camp-info`);
      const data = await response.json();
      setCampInfo(data);
      setCampSettings({
        camp_name: data.camp_name || '',
        camp_date: data.camp_date || '',
        location: data.location || '',
        description: data.description || '',
        max_participants: data.max_participants?.toString() || '50'
      });
    } catch (error) {
      console.error('Error fetching camp info:', error);
    }
  };

  const DeleteConfirmationModal = ({ scout, onConfirm, onCancel, isDeleting }: any) => {
    if (!scout) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            disabled={isDeleting}
          >
            <X size={20} />
          </button>

          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-full mr-3">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold">Delete Scout</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <strong>{scout.name}</strong>? This action cannot be undone and will also delete all associated food records.
          </p>

          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700 text-sm">
              <strong>Warning:</strong> This will permanently remove:
            </p>
            <ul className="text-red-600 text-sm list-disc list-inside mt-1">
              <li>Scout profile information</li>
              <li>All food distribution records</li>
              <li>Registration data</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(scout.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete Scout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const fetchFoodEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/food/date/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFoodEntries(data);
      }
    } catch (error) {
      console.error('Error fetching food entries:', error);
    }
  };

  const handleRegisterScout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/scout/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newScout
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Scout registered successfully!');
        setNewScout({
          name: '',
          name_bangla: '',
          bsID: '',
          email: '',
          unitName: '',
          fatherName: '',
          motherName: '',
          address: '',
          bloodGroup: '',
          password: '',
          age: '',
          phone: '',
          emergency_contact: '',
          paymentAmount: '',
          image_url: '',
          scout_type: 'scout'
        });
        fetchScouts();
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setMessage('Error registering scout');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCampInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/camp-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...campSettings,
          max_participants: parseInt(campSettings.max_participants)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Camp info updated successfully!');
        setCampInfo(data.campInfo);
      } else {
        setMessage(data.error || 'Update failed');
      }
    } catch (error) {
      setMessage('Error updating camp info');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFoodEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newFoodEntry)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Food entry added successfully!');
        setNewFoodEntry({
          scoutId: '',
          food_name: '',
          food_time: 'breakfast',
          food_date: new Date().toISOString().split('T')[0],
          received: false
        });
        fetchFoodEntries();
      } else {
        setMessage(data.error || 'Failed to add food entry');
      }
    } catch (error) {
      setMessage('Error adding food entry');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFoodStatus = async (foodId: number, received: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${production_url}/api/food/${foodId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ received })
      });

      if (response.ok) {
        setMessage('Food status updated successfully!');
        fetchFoodEntries();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update food status');
      }
    } catch (error) {
      setMessage('Error updating food status');
      console.error('Error:', error);
    }
  };

  // Scout search functions
  const openScoutSearch = () => {
    setShowScoutSearch(true);
    setSearchQuery('');
    setFilteredScouts(scouts);
  };

  const closeScoutSearch = () => {
    setShowScoutSearch(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setFilteredScouts(scouts);
    } else {
      const filtered = scouts.filter(scout =>
        scout.name.toLowerCase().includes(query) ||
        scout.email.toLowerCase().includes(query) ||
        scout.id.toString().includes(query) ||
        (scout.phone && scout.phone.includes(query)) ||
        scout.scout_type.toLowerCase().includes(query)
      );
      setFilteredScouts(filtered);
    }
  };

  const selectScout = (scout: Scout) => {
    setNewFoodEntry({ ...newFoodEntry, scoutId: scout.id.toString() });
    closeScoutSearch();
  };

  const clearSelectedScout = () => {
    setNewFoodEntry({ ...newFoodEntry, scoutId: '' });
  };

  const getSelectedScoutName = () => {
    if (!newFoodEntry.scoutId) return '';
    const scout = scouts.find(s => s.id.toString() === newFoodEntry.scoutId);
    return scout ? scout.name : '';
  };

  const getTimeLabel = (time: string) => {
    const labels = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack'
    };
    return labels[time as keyof typeof labels] || time;
  };

  const getScoutTypeLabel = (type: string) => {
    const typeObj = scoutTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('scouts')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'scouts'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Users size={16} />
                <span>Scouts ({scouts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'register'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <UserPlus size={16} />
                <span>Register Scout</span>
              </button>
              <button
                onClick={() => setActiveTab('food')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'food'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Utensils size={16} />
                <span>Food Management</span>
              </button>
              <button
                onClick={() => setActiveTab('kits')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'kits'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Settings size={16} />
                <span>Kits management</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'settings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Settings size={16} />
                <span>Camp Settings</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') || message.includes('Success')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                {message}
              </div>
            )}

            {activeTab === 'scouts' && (
              scouts.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No scouts registered yet</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {scouts.map((scout) => (
                    <div
                      key={scout.id}
                      onClick={() => openModal(scout)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start space-x-4">
                        {scout.image_url ? (
                          <img
                            src={scout.image_url}
                            alt={scout.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Users size={24} className="text-green-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-gray-900">{scout.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {getScoutTypeLabel(scout.scout_type)}
                            </span>
                          </div>
                          <p className="text-gray-600">{scout.email}</p>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-500">
                            <div>Age: {scout.age || "Not provided"}</div>
                            <div>Phone: {scout.phone || "Not provided"}</div>
                          </div>
                          {scout.emergency_contact && (
                            <div className="text-sm text-gray-500 mt-1">
                              Emergency Contact: {scout.emergency_contact}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {selectedScout && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex space-x-4">
                    {selectedScout.image_url ? (
                      <img
                        src={selectedScout.image_url}
                        alt={selectedScout.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <Users size={36} className="text-green-600" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">{selectedScout.name}</h2>
                      <p className="text-gray-500">{selectedScout.email}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-sm bg-green-100 text-green-700 w-[120px] h-[28px] rounded-full flex justify-center items-center">
                          {getScoutTypeLabel(selectedScout.scout_type)}
                        </span>
                        <span className="text-sm bg-green-100 text-green-700 w-[120px] h-[28px] rounded-full flex justify-center items-center gap-1">
                          <CheckCircle size={14} /> Registered
                        </span>
                      </div>
                      <div className="mt-[10px] text-sm bg-purple-100 text-green-700 w-[120px] h-[28px] rounded-full flex justify-center items-center">
                        Fee - {selectedScout.payment_amount || 1000}tk
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <div><strong>ID:</strong> SFC25-{selectedScout.id}</div>
                    <div><strong>BS ID:</strong> {selectedScout.bsID}</div>
                    <div><strong>Unit Name:</strong> {selectedScout.unitName}</div>
                    <div><strong>Name (Bangla):</strong> {selectedScout.name_bangla}</div>
                    <div><strong>Date of Birth:</strong> {selectedScout.age || "Not provided"}</div>
                    <div><strong>Father's Name:</strong> {selectedScout.fatherName}</div>
                    <div><strong>Mother's Name:</strong> {selectedScout.motherName}</div>
                    <div><strong>Address:</strong> {selectedScout.address}</div>
                    <div><strong>Blood Group:</strong> {selectedScout.bloodGroup}</div>
                    <div><strong>Phone:</strong> {selectedScout.phone}</div>
                    <div><strong>Emergency Contact:</strong> {selectedScout.emergency_contact || "Not provided"}</div>
                    <div><strong>Registered By (Admin ID):</strong> {selectedScout.registered_by ?? "Unknown"}</div>
                    <div><strong>Created At:</strong> {new Date(selectedScout.created_at).toLocaleString()}</div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => { setEditScout({ ...selectedScout }); closeModal() }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Scout
                    </button>
                    <button
                      onClick={() => { setDeleteConfirm(selectedScout); closeModal(); }}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Scout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Scout Modal */}
            {editScout && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                  <button
                    onClick={() => setEditScout(null)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    disabled={isUpdating}
                  >
                    <X size={20} />
                  </button>

                  <h2 className="text-2xl font-bold mb-6">Edit Scout Information</h2>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await updateScout(editScout.id, editScout);
                      alert('Scout updated successfully!');
                    } catch (error: any) {
                      alert(`Error: ${error.message}`);
                    }
                  }}>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Basic Information */}
                      <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Basic Information</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={editScout.name || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (Bangla)</label>
                        <input
                          type="text"
                          value={editScout.name_bangla || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, name_bangla: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editScout.email || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BS ID *</label>
                        <input
                          type="text"
                          value={editScout.bsID || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, bsID: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input
                          type="text"
                          value={editScout.password || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, password: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name *</label>
                        <input
                          type="text"
                          value={editScout.unitName || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, unitName: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="text"
                          value={editScout.age || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, age: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="DD/MM/YYYY"
                        />
                      </div>

                      {/* Contact Information */}
                      <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Contact Information</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={editScout.phone || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, phone: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                        <input
                          type="text"
                          value={editScout.emergency_contact || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, emergency_contact: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Family Information */}
                      <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Family Information</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                        <input
                          type="text"
                          value={editScout.fatherName || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, fatherName: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                        <input
                          type="text"
                          value={editScout.motherName || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, motherName: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          value={editScout.address || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, address: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Additional Information */}
                      <div className="col-span-2 mt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Additional Information</h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                        <select
                          value={editScout.bloodGroup || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, bloodGroup: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scout Type</label>
                        <select
                          value={editScout.scout_type || 'scout'}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, scout_type: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="scout">Scout</option>
                          <option value="rover">Rover</option>
                          <option value="leader">Leader</option>
                          <option value="volunteer">Volunteer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (tk)</label>
                        <input
                          type="number"
                          value={editScout.payment_amount || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, payment_amount: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={editScout.image_url || ''}
                          onChange={(e) => setEditScout((prev: any) => ({ ...prev, image_url: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setEditScout(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Update Scout
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add the confirmation modal */}
            <DeleteConfirmationModal
              scout={deleteConfirm}
              onConfirm={deleteScout}
              onCancel={() => setDeleteConfirm(null)}
              isDeleting={isDeleting}
            />


            {activeTab === 'register' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New Scout</h2>
                <form onSubmit={handleRegisterScout} className="max-w-2xl">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={newScout.name}
                        onChange={(e) => setNewScout({ ...newScout, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        নাম (বাংলায়) *
                      </label>
                      <input
                        type="text"
                        value={newScout.name_bangla}
                        onChange={(e) => setNewScout({ ...newScout, name_bangla: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newScout.email}
                        onChange={(e) => setNewScout({ ...newScout, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-2">
                        Payment Amount *
                      </label>
                      <input
                        type="text"
                        value={newScout.paymentAmount}
                        onChange={(e) => setNewScout({ ...newScout, paymentAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={newScout.password}
                        onChange={(e) => setNewScout({ ...newScout, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BS ID *
                      </label>
                      <input
                        type="text"
                        value={newScout.bsID}
                        onChange={(e) => setNewScout({ ...newScout, bsID: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit *
                      </label>
                      <input
                        type="text"
                        value={newScout.unitName}
                        onChange={(e) => setNewScout({ ...newScout, unitName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name *
                      </label>
                      <input
                        type="text"
                        value={newScout.fatherName}
                        onChange={(e) => setNewScout({ ...newScout, fatherName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Name *
                      </label>
                      <input
                        type="text"
                        value={newScout.motherName}
                        onChange={(e) => setNewScout({ ...newScout, motherName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={newScout.address}
                        onChange={(e) => setNewScout({ ...newScout, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group *
                      </label>
                      <select
                        value={newScout.bloodGroup}
                        onChange={(e) => setNewScout({ ...newScout, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        {bloodTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Of Birth
                        </label>
                        <input
                          type="date"
                          value={newScout.age}
                          onChange={(e) => setNewScout({ ...newScout, age: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scout Type *
                        </label>
                        <select
                          value={newScout.scout_type}
                          onChange={(e) => setNewScout({ ...newScout, scout_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          {scoutTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={newScout.phone}
                          onChange={(e) => setNewScout({ ...newScout, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact
                        </label>
                        <input
                          type="text"
                          value={newScout.emergency_contact}
                          onChange={(e) => setNewScout({ ...newScout, emergency_contact: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Name and phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Image URL
                      </label>
                      <input
                        type="url"
                        value={newScout.image_url}
                        onChange={(e) => setNewScout({ ...newScout, image_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>{loading ? 'Registering...' : 'Register Scout'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'food' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Food Management</h2>
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Select Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Add Food Entry Form */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Food Entry</h3>
                    <form onSubmit={handleAddFoodEntry} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scout *
                        </label>
                        {newFoodEntry.scoutId ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                              <span className="font-medium text-green-800">{getSelectedScoutName()}</span>
                              <span className="text-green-600 ml-2">(ID: {newFoodEntry.scoutId})</span>
                            </div>
                            <button
                              type="button"
                              onClick={clearSelectedScout}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={openScoutSearch}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <span className="text-gray-500">Select a scout...</span>
                            <Search size={16} className="text-gray-400" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Food Name *
                        </label>
                        <input
                          type="text"
                          value={newFoodEntry.food_name}
                          onChange={(e) => setNewFoodEntry({ ...newFoodEntry, food_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Spaghetti Bolognese, Chicken Sandwich"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meal Time *
                          </label>
                          <select
                            value={newFoodEntry.food_time}
                            onChange={(e) => setNewFoodEntry({ ...newFoodEntry, food_time: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={newFoodEntry.food_date}
                            onChange={(e) => setNewFoodEntry({ ...newFoodEntry, food_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !newFoodEntry.scoutId}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Plus size={16} />
                        <span>{loading ? 'Adding...' : 'Add Food Entry'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Food Entries List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Food Entries for {new Date(selectedDate).toLocaleDateString()}
                    </h3>

                    {foodEntries.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Utensils size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No food entries for this date</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((time) => {
                          const timeEntries = foodEntries.filter(entry => entry.food_time === time);

                          if (timeEntries.length === 0) return null;

                          return (
                            <div key={time} className="border border-gray-200 rounded-lg">
                              <div className="bg-green-50 px-4 py-2 border-b border-gray-200">
                                <h4 className="font-semibold text-green-800">{getTimeLabel(time)}</h4>
                              </div>
                              <div className="divide-y divide-gray-200">
                                {timeEntries.map((entry) => (
                                  <div key={entry.id} className="px-4 py-3 flex justify-between items-center">
                                    <div>
                                      <span className="font-medium text-gray-900">{entry.scout_name}</span>
                                      <span className="text-gray-600 ml-2">- {entry.food_name}</span>
                                      <span className="text-xs text-gray-500 ml-2">(ID: {entry.scout_id})</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleUpdateFoodStatus(entry.id, !entry.received)}
                                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${entry.received
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                                          }`}
                                      >
                                        {entry.received ? (
                                          <>
                                            <CheckCircle size={14} />
                                            <span>Received</span>
                                          </>
                                        ) : (
                                          <>
                                            <XCircle size={14} />
                                            <span>Not Received</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scout Search Modal */}
                {showScoutSearch && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">Select Scout</h3>
                          <button
                            onClick={closeScoutSearch}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="mt-3 relative">
                          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by name, email, ID, phone, or type..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-64">
                        {filteredScouts.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No scouts found matching your search.
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {filteredScouts.map((scout) => (
                              <button
                                key={scout.id}
                                onClick={() => selectScout(scout)}
                                className="w-full p-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="font-medium text-gray-900">{scout.name}</div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {getScoutTypeLabel(scout.scout_type)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">ID: {scout.id}</div>
                                <div className="text-sm text-gray-600">{scout.email}</div>
                                {scout.phone && (
                                  <div className="text-sm text-gray-600">Phone: {scout.phone}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'kits' && (
              <>
                <KitManagement />
              </>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Camp Settings</h2>
                <form onSubmit={handleUpdateCampInfo} className="max-w-2xl">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Camp Name
                      </label>
                      <input
                        type="text"
                        value={campSettings.camp_name}
                        onChange={(e) => setCampSettings({ ...campSettings, camp_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Camp Dates
                      </label>
                      <input
                        type="text"
                        value={campSettings.camp_date}
                        onChange={(e) => setCampSettings({ ...campSettings, camp_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., July 15-22, 2025"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={campSettings.location}
                        onChange={(e) => setCampSettings({ ...campSettings, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={campSettings.description}
                        onChange={(e) => setCampSettings({ ...campSettings, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        value={campSettings.max_participants}
                        onChange={(e) => setCampSettings({ ...campSettings, max_participants: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Camp Info'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;