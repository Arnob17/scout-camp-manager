import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, UserPlus, Utensils, Calendar, CheckCircle, XCircle, Search, X } from 'lucide-react';

interface Scout {
  id: number;
  name: string;
  email: string;
  age: number;
  phone: string;
  emergency_contact: string;
  image_url: string;
  scout_type: string;
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
  const [activeTab, setActiveTab] = useState<'scouts' | 'register' | 'settings' | 'food'>('scouts');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // New scout form state
  const [newScout, setNewScout] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    phone: '',
    emergency_contact: '',
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

  // Scout types
  const scoutTypes = [
    { value: 'cub', label: 'Cub Scout' },
    { value: 'scout', label: 'Scout' },
    { value: 'rover', label: 'Rover' },
    { value: 'venturer', label: 'Parents' },
    { value: 'leader', label: 'Leader' },
    { value: 'volunteer', label: 'Volunteer' }
  ];

  useEffect(() => {
    fetchScouts();
    fetchCampInfo();
    fetchFoodEntries();
  }, [selectedDate]);

  const fetchScouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scouts', {
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

  const fetchCampInfo = async () => {
    try {
      const response = await fetch('/api/camp-info');
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

  const fetchFoodEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/food/date/${selectedDate}`, {
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
      const response = await fetch('/api/scout/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newScout,
          age: parseInt(newScout.age) || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Scout registered successfully!');
        setNewScout({
          name: '',
          email: '',
          password: '',
          age: '',
          phone: '',
          emergency_contact: '',
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
      const response = await fetch('/api/camp-info', {
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
      const response = await fetch('/api/food', {
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
      const response = await fetch(`/api/food/${foodId}/status`, {
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
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Scouts</h2>
                {scouts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No scouts registered yet</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {scouts.map((scout) => (
                      <div key={scout.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                              <div>Age: {scout.age || 'Not provided'}</div>
                              <div>Phone: {scout.phone || 'Not provided'}</div>
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
                )}
              </div>
            )}

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
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newScout.email}
                        onChange={(e) => setNewScout({ ...newScout, email: e.target.value })}
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
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
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={newScout.phone}
                          onChange={(e) => setNewScout({ ...newScout, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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