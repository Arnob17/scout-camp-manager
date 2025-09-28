import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Users, Package, Utensils, Check, X } from 'lucide-react';

interface CampInfo {
  camp_name: string;
  camp_date: string;
  location: string;
  description: string;
  max_participants: number;
}

interface KitInfo {
  tshirt: number;
  scarf: number;
  waggle: number;
  keychain: number;
  pen: number;
  notes: string;
  issued_at: string;
  issued_by_name: string;
}

interface FoodEntry {
  id: number;
  food_name: string;
  food_time: string;
  food_date: string;
  received: number;
  created_at: string;
}

interface ScoutProfileProps {
  user: any;
}

const ScoutProfile: React.FC<ScoutProfileProps> = ({ user }) => {
  const [campInfo, setCampInfo] = useState<CampInfo | null>(null);
  const [kitInfo, setKitInfo] = useState<KitInfo | null>(null);
  const [foodHistory, setFoodHistory] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'kit', 'food'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch camp info
      const campResponse = await fetch('https://camp-backend-production.up.railway.app/api/camp-info');
      const campData = await campResponse.json();
      setCampInfo(campData);

      // Fetch kit info
      const kitResponse = await fetch(`https://camp-backend-production.up.railway.app/api/kits/scout/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (kitResponse.ok) {
        const kitData = await kitResponse.json();
        setKitInfo(kitData.kit);
      }

      // Fetch food history
      const foodResponse = await fetch(`https://camp-backend-production.up.railway.app/api/food/scout/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (foodResponse.ok) {
        const foodData = await foodResponse.json();
        setFoodHistory(foodData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kitItems = [
    { key: 'tshirt', label: 'T-Shirt' },
    { key: 'scarf', label: 'Scarf' },
    { key: 'waggle', label: 'Waggle' },
    { key: 'keychain', label: 'Keychain' },
    { key: 'pen', label: 'Pen' },
  ];

  const getFoodStatus = (received: number) => {
    return received === 1 ? 'Received' : 'Not Received';
  };

  const getFoodStatusColor = (received: number) => {
    return received === 1 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-6">
              {user.image_url ? (
                <img
                  src={user.image_url}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-200"
                />
              ) : (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-200">
                  <User size={40} className="text-green-600" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">Scout ID: SFC25-{user.id}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone size={14} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'profile'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('kit')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'kit'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Kit Status
                </button>
                <button
                  onClick={() => setActiveTab('food')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'food'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Food History
                </button>
              </div>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.age && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="font-medium">{user.age} years old</p>
                      </div>
                    </div>
                  )}

                  {user.emergency_contact && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Emergency Contact</p>
                        <p className="font-medium">{user.emergency_contact}</p>
                      </div>
                    </div>
                  )}

                  {user.bloodGroup && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Blood Group</p>
                        <p className="font-medium">{user.bloodGroup}</p>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{user.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Camp Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Camp Information</h2>
                {campInfo ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        {campInfo.camp_name}
                      </h3>
                      <p className="text-gray-600">{campInfo.description}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Camp Dates</p>
                        <p className="font-medium">{campInfo.camp_date}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{campInfo.location}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-green-800 mb-2">You're Registered!</h4>
                      <p className="text-green-700 text-sm">
                        You have successfully registered for this camp. We look forward to seeing you there!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Camp information not available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kit Status Tab */}
          {activeTab === 'kit' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Package className="mr-3" size={24} />
                  Scout Kit Status
                </h2>
                {kitInfo && (
                  <div className="text-sm text-gray-500">
                    Issued on: {new Date(kitInfo.issued_at).toLocaleDateString()}
                    {kitInfo.issued_by_name && ` by ${kitInfo.issued_by_name}`}
                  </div>
                )}
              </div>

              {kitInfo ? (
                <div className="space-y-6">
                  {/* Kit Items Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kitItems.map((item) => (
                      <div
                        key={item.key}
                        className={`border rounded-lg p-4 ${kitInfo[item.key as keyof KitInfo]
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{item.label}</h3>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${kitInfo[item.key as keyof KitInfo]
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                              }`}
                          >
                            {kitInfo[item.key as keyof KitInfo] ? (
                              <Check size={16} />
                            ) : (
                              <X size={16} />
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-sm mt-2 ${kitInfo[item.key as keyof KitInfo]
                              ? 'text-green-700'
                              : 'text-red-700'
                            }`}
                        >
                          {kitInfo[item.key as keyof KitInfo] ? 'Received' : 'Not Received'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Overall Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Overall Kit Status</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-700">
                          Received {kitItems.filter(item => kitInfo[item.key as keyof KitInfo]).length} out of {kitItems.length} items
                        </p>
                        {kitInfo.notes && (
                          <p className="text-blue-600 text-sm mt-1">
                            <strong>Notes:</strong> {kitInfo.notes}
                          </p>
                        )}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${kitItems.filter(item => kitInfo[item.key as keyof KitInfo]).length === kitItems.length
                            ? 'bg-green-100 text-green-800'
                            : kitItems.filter(item => kitInfo[item.key as keyof KitInfo]).length > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {kitItems.filter(item => kitInfo[item.key as keyof KitInfo]).length === kitItems.length
                          ? 'Complete'
                          : kitItems.filter(item => kitInfo[item.key as keyof KitInfo]).length > 0
                            ? 'Partial'
                            : 'Not Issued'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Kit Issued Yet</h3>
                  <p className="text-gray-500">Your kit has not been issued yet. Please check with camp administration.</p>
                </div>
              )}
            </div>
          )}

          {/* Food History Tab */}
          {activeTab === 'food' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Utensils className="mr-3" size={24} />
                Food Distribution History
              </h2>

              {foodHistory.length > 0 ? (
                <div className="space-y-4">
                  {foodHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{entry.food_name}</h3>
                          <p className="text-sm text-gray-600">
                            {entry.food_time} • {new Date(entry.food_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getFoodStatusColor(
                            entry.received
                          )}`}
                        >
                          {getFoodStatus(entry.received)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Recorded: {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Food Records</h3>
                  <p className="text-gray-500">No food distribution records found for your account.</p>
                </div>
              )}

              {/* Food Summary */}
              {foodHistory.length > 0 && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Food Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-green-700">Total Meals</p>
                      <p className="font-semibold text-green-800">{foodHistory.length}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Received</p>
                      <p className="font-semibold text-green-800">
                        {foodHistory.filter(entry => entry.received === 1).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700">Not Received</p>
                      <p className="font-semibold text-green-800">
                        {foodHistory.filter(entry => entry.received === 0).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700">Completion Rate</p>
                      <p className="font-semibold text-green-800">
                        {Math.round(
                          (foodHistory.filter(entry => entry.received === 1).length / foodHistory.length) * 100
                        )}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Information (only show in profile tab) */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">What to Bring</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sleeping bag and pillow</li>
                    <li>• Weather-appropriate clothing</li>
                    <li>• Personal hygiene items</li>
                    <li>• Reusable water bottle</li>
                    <li>• Hiking boots or sturdy shoes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Camp Activities</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Hiking and nature exploration</li>
                    <li>• Campfire activities and songs</li>
                    <li>• Outdoor skills training</li>
                    <li>• Team building exercises</li>
                    <li>• Arts and crafts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoutProfile;