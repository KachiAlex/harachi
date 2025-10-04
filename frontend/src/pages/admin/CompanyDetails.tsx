import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Company } from '../../types';

const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getCompanyById(id);
        setCompany(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load company');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!company) return <div className="p-6">Not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-600">Code: {company.code}</p>
        </div>
        <Link to="/admin/companies" className="btn-secondary">Back</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">General</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Status</span><span className={company.isActive ? 'text-green-700' : 'text-red-700'}>{company.isActive ? 'Active' : 'Inactive'}</span></div>
            {company.schemaName && (
              <div className="flex justify-between"><span>Schema</span><span>{company.schemaName}</span></div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
          <div className="flex gap-3">
            <Link to={`/company/license`} className="btn-primary">View License</Link>
            <Link to={`/company/setup`} className="btn-secondary">Setup Wizard</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;


