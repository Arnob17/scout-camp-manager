import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Users } from 'lucide-react';

interface CampInfo {
  camp_name: string;
  camp_date: string;
  location: string;
  description: string;
  max_participants: number;
}

interface ScoutProfileProps {
  user: any;
}

const ScoutProfile: React.FC<ScoutProfileProps> = ({ user }) => {
  const [campInfo, setCampInfo] = useState<CampInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampInfo();
  }, []);

  const fetchCampInfo = async () => {
    try {
      const response = await fetch('https://camp-backend-production.up.railway.app/api/camp-info');
      const data = await response.json();
      setCampInfo(data);
    } catch (error) {
      console.error('Error fetching camp info:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-4xl mx-auto">
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name} (ID: {user.id})</h1>
                <p className="text-gray-600">Scout Member</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                  {user.age && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{user.age} years old</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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

          {/* Additional Information */}
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
        </div>
      </div>
    </div>
  );
};

export default ScoutProfile;