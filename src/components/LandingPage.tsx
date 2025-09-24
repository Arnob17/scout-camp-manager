import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Users, Tent } from 'lucide-react';
import logo from "../public/logo.jpg"
import camp from "../public/camp.png"
interface CampInfo {
  camp_name: string;
  camp_date: string;
  location: string;
  description: string;
  max_participants: number;
}

const LandingPage: React.FC = () => {
  const [campInfo, setCampInfo] = useState<CampInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampInfo();
  }, []);

  const fetchCampInfo = async () => {
    try {
      const response = await fetch('/api/camp-info');
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative text-white">
        <img src={camp} className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              {campInfo?.camp_name || 'Scout Adventure Camp'}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {campInfo?.description || 'Join us for an unforgettable outdoor adventure!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg flex items-center space-x-2">
                <Calendar size={20} />
                <span>{campInfo?.camp_date || 'Coming Soon'}</span>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg flex items-center space-x-2">
                <MapPin size={20} />
                <span>{campInfo?.location || 'Location TBD'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Camp Highlights</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our camp offers a perfect blend of adventure, learning, and friendship building activities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tent size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Outdoor Adventures</h3>
            <p className="text-gray-600">
              Experience hiking, camping, and nature exploration with expert guides
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Building</h3>
            <p className="text-gray-600">
              Develop leadership skills and build lasting friendships through group activities
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Skill Development</h3>
            <p className="text-gray-600">
              Learn practical outdoor skills, first aid, and environmental stewardship
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">
                {campInfo?.max_participants || 50}
              </div>
              <div className="text-green-200">Max Participants</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4</div>
              <div className="text-green-200">Days of Adventure</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-green-200">Fun Guaranteed</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Ready to Join the Adventure?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Contact your local scout leader or check with our admin team for registration details
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-green-800 font-semibold mb-2">For Scouts:</p>
          <p className="text-gray-600 mb-4">Log in to view your profile and camp details</p>
          <p className="text-green-800 font-semibold mb-2">For Administrators:</p>
          <p className="text-gray-600">Manage camp details and scout registrations</p>
        </div>
      </div>
    </div >
  );
};

export default LandingPage;