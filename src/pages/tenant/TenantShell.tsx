import React from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';

const TenantShell: React.FC = () => {
  const { tenantId } = useParams();
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Tenant: {tenantId}</h1>
        <div className="mt-3 flex gap-3 text-sm">
          <NavLink to="settings" className={({ isActive }) => isActive ? 'text-blue-700 font-medium' : 'text-blue-600'}>Settings</NavLink>
          <NavLink to="countries" className={({ isActive }) => isActive ? 'text-blue-700 font-medium' : 'text-blue-600'}>Countries</NavLink>
          <NavLink to="branches" className={({ isActive }) => isActive ? 'text-blue-700 font-medium' : 'text-blue-600'}>Branches</NavLink>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default TenantShell;


