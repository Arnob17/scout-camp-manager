import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, UserPlus } from 'lucide-react';

interface Scout {
  id: number;
  name: string;
  email: string;
  age: number;
  phone: string;
  emergency_contact: string;
  image_url: string;
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

interface AdminDashboardProps {
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [campInfo, setCampInfo] = useState<CampInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'scouts' | 'register' | 'settings'>('scouts');
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
    image_url: ''
  });

  // Camp settings form state
  const [campSettings, setCampSettings] = useState({
    camp_name: '',
    camp_date: '',
    location: '',
    description: '',
    max_participants: ''
  });

  useEffect(() => {
    fetchScouts();
    fetchCampInfo();
  }, []);

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
          image_url: ''
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('scouts')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'scouts'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users size={16} />
                <span>Scouts ({scouts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'register'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus size={16} />
                <span>Register Scout</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'settings'
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
              <div className={`mb-4 p-4 rounded-lg ${
                message.includes('successfully') || message.includes('Success')
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
                            <h3 className="font-semibold text-lg text-gray-900">{scout.name}</h3>
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
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={newScout.phone}
                          onChange={(e) => setNewScout({ ...newScout, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
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