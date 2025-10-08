import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, ArrowRight, Users, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import { Branch, Country } from '../../types';
import { useBranch } from '../../contexts/BranchContext';

const BranchSelection: React.FC = () => {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();
  const { selectBranch } = useBranch();
  
  const [company, setCompany] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [companyCode]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!companyCode) {
        setError('Company code not found');
        return;
      }

      // Load company
      const companyData = await apiService.getCompanyByCode(companyCode);
      if (!companyData) {
        setError('Company not found');
        return;
      }
      setCompany(companyData);

      // Load branches and countries
      const [branchesData, countriesData] = await Promise.all([
        apiService.getBranches(companyData.id),
        apiService.getCountries(companyData.id)
      ]);

      setBranches(branchesData);
      setCountries(countriesData);

      // If only one branch, auto-select it
      if (branchesData.length === 1) {
        handleBranchSelect(branchesData[0]);
      }

    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branch: Branch) => {
    // Store selected branch in context
    selectBranch(branch);
    
    // Navigate to company-specific branch dashboard
    navigate(`/company/${companyCode}/branch/${branch.id}/dashboard`);
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country ? `${country.name} (${country.code})` : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Building2 className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">{company?.name}</h1>
              <p className="text-sm text-gray-500">Select a branch to continue</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to {company?.name}!
            </h2>
            <p className="text-lg text-gray-600">
              Select a branch to access inventory, sales, and operations
            </p>
          </div>

          {/* No Branches Message */}
          {branches.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Branches Available</h3>
              <p className="text-gray-600 mb-6">
                Please complete the setup wizard to add branches
              </p>
              <button
                onClick={() => navigate(`/company/${companyCode}/setup`)}
                className="btn-primary"
              >
                Go to Setup
              </button>
            </div>
          )}

          {/* Branches Grid */}
          {branches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden cursor-pointer group"
                  onClick={() => handleBranchSelect(branch)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {branch.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getCountryName(branch.countryId)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>

                    {branch.address && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">{branch.address}</p>
                      </div>
                    )}

                    {(branch.phone || branch.email) && (
                      <div className="space-y-1 mb-4">
                        {branch.phone && (
                          <p className="text-xs text-gray-500">📞 {branch.phone}</p>
                        )}
                        {branch.email && (
                          <p className="text-xs text-gray-500">✉️ {branch.email}</p>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          Inventory
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Team
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-3 group-hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                        Access Branch
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back to Portal */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(`/company/${companyCode}`)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Company Portal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BranchSelection;

