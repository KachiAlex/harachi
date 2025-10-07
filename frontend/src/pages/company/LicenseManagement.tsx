import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { License } from '../../types/license';
import { useRole } from '../../contexts/RoleContext';

const LicenseManagement: React.FC = () => {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();
  const { isCompanyAdmin } = useRole();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLicense = useCallback(async () => {
    if (!companyCode) return;
    
    try {
      setLoading(true);
      const company = await apiService.getCompanyByCode(companyCode);
      if (company) {
        const licenseData = await apiService.getCompanyLicense(company.id);
        setLicense(licenseData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load license');
    } finally {
      setLoading(false);
    }
  }, [companyCode]);

  useEffect(() => {
    if (!isCompanyAdmin) {
      navigate(`/company/${companyCode}`);
      return;
    }
    loadLicense();
  }, [companyCode, isCompanyAdmin, navigate, loadLicense]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'grace':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'blocked':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'grace':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isCompanyAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need Company Admin privileges to manage licenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600" />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">License Management</h1>
                <p className="text-sm text-gray-500">Manage your company license</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/company/${companyCode}`)}
              className="btn-secondary"
            >
              Back to Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {license ? (
          <div className="space-y-6">
            {/* License Status Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">License Status</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(license.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                    {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">License Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{license.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Seats</p>
                  <p className="text-lg font-semibold text-gray-900">{license.seats}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expires</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(license.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* License Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">License Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Issued Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(license.issuedAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(license.expiresAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">License ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{license.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{license.companyId}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No License Found</h3>
            <p className="text-gray-600 mb-6">Your company doesn't have an active license.</p>
            <button
              onClick={() => navigate(`/company/${companyCode}/setup`)}
              className="btn-primary"
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseManagement;
