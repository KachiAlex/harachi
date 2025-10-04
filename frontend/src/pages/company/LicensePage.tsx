import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const LicensePage: React.FC = () => {
  const { user } = useAuth();
  const [license, setLicense] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.company?.id) {
        setLoading(false);
        return;
      }
      try {
        const active = await apiService.getActiveLicense(user.company.id);
        setLicense(active);
      } catch (e: any) {
        setError(e?.message || 'Failed to load license');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.company?.id]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('License code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company License</h1>
        <p className="text-gray-600">Manage your subscription and license status.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      )}

      {license ? (
        <div className="space-y-6">
          {/* License Code Card */}
          <div className="card">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">Active License</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">Active</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">License Code</label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-white border rounded-lg p-3 font-mono text-lg font-semibold text-gray-900 break-all">
                      {license.code}
                    </div>
                    <button
                      onClick={() => copyToClipboard(license.code)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        copied 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* License Details Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">License Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date</label>
                <p className="text-sm text-gray-900 font-medium">{new Date(license.issuedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <p className="text-sm text-gray-900 font-medium">{new Date(license.expiresAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <p className="text-sm text-gray-900 font-medium">{license.years} year(s)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active License</h3>
            <p className="text-gray-700 mb-4">No active license found for your company.</p>
            <p className="text-sm text-gray-500">Contact your system administrator to issue a license.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicensePage;


