import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, MapPin, Building2, Users, Settings } from 'lucide-react';

const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    countries: [{ name: '', code: '' }],
    branches: [{ name: '', code: '', address: '', countryId: '' }],
    chartOfAccounts: [],
    warehouses: [{ name: '', code: '', address: '' }],
    taxRules: { rate: 0, name: '' },
  });

  const steps = [
    { id: 1, name: 'Countries', icon: MapPin },
    { id: 2, name: 'Branches', icon: Building2 },
    { id: 3, name: 'Users', icon: Users },
    { id: 4, name: 'Configuration', icon: Settings },
  ];

  const addCountry = () => {
    setFormData({
      ...formData,
      countries: [...formData.countries, { name: '', code: '' }],
    });
  };

  const addBranch = () => {
    setFormData({
      ...formData,
      branches: [...formData.branches, { name: '', code: '', address: '', countryId: '' }],
    });
  };

  const addWarehouse = () => {
    setFormData({
      ...formData,
      warehouses: [...formData.warehouses, { name: '', code: '', address: '' }],
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Countries</h3>
              <p className="text-gray-600">Add the countries where your company operates.</p>
            </div>
            
            {formData.countries.map((country, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country Name
                  </label>
                  <input
                    type="text"
                    value={country.name}
                    onChange={(e) => {
                      const newCountries = [...formData.countries];
                      newCountries[index].name = e.target.value;
                      setFormData({ ...formData, countries: newCountries });
                    }}
                    className="input-field"
                    placeholder="e.g., United States"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={country.code}
                    onChange={(e) => {
                      const newCountries = [...formData.countries];
                      newCountries[index].code = e.target.value;
                      setFormData({ ...formData, countries: newCountries });
                    }}
                    className="input-field"
                    placeholder="e.g., US"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addCountry}
              className="btn-secondary flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Add Another Country</span>
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Branches</h3>
              <p className="text-gray-600">Add branches for each country.</p>
            </div>
            
            {formData.branches.map((branch, index) => (
              <div key={index} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => {
                        const newBranches = [...formData.branches];
                        newBranches[index].name = e.target.value;
                        setFormData({ ...formData, branches: newBranches });
                      }}
                      className="input-field"
                      placeholder="e.g., New York Branch"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      value={branch.code}
                      onChange={(e) => {
                        const newBranches = [...formData.branches];
                        newBranches[index].code = e.target.value;
                        setFormData({ ...formData, branches: newBranches });
                      }}
                      className="input-field"
                      placeholder="e.g., NY01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={branch.address}
                    onChange={(e) => {
                      const newBranches = [...formData.branches];
                      newBranches[index].address = e.target.value;
                      setFormData({ ...formData, branches: newBranches });
                    }}
                    className="input-field"
                    rows={2}
                    placeholder="Enter branch address"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addBranch}
              className="btn-secondary flex items-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Add Another Branch</span>
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Branch Admins</h3>
              <p className="text-gray-600">Assign administrators for each branch.</p>
            </div>
            
            <div className="space-y-4">
              {formData.branches.map((branch, index) => (
                <div key={index} className="card">
                  <h4 className="font-medium text-gray-900 mb-3">{branch.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="admin@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure System</h3>
              <p className="text-gray-600">Set up chart of accounts, warehouses, and tax rules.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Warehouses</h4>
                {formData.warehouses.map((warehouse, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      value={warehouse.name}
                      onChange={(e) => {
                        const newWarehouses = [...formData.warehouses];
                        newWarehouses[index].name = e.target.value;
                        setFormData({ ...formData, warehouses: newWarehouses });
                      }}
                      className="input-field"
                      placeholder="Warehouse Name"
                    />
                    <input
                      type="text"
                      value={warehouse.code}
                      onChange={(e) => {
                        const newWarehouses = [...formData.warehouses];
                        newWarehouses[index].code = e.target.value;
                        setFormData({ ...formData, warehouses: newWarehouses });
                      }}
                      className="input-field"
                      placeholder="Code"
                    />
                    <input
                      type="text"
                      value={warehouse.address}
                      onChange={(e) => {
                        const newWarehouses = [...formData.warehouses];
                        newWarehouses[index].address = e.target.value;
                        setFormData({ ...formData, warehouses: newWarehouses });
                      }}
                      className="input-field"
                      placeholder="Address"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addWarehouse}
                  className="btn-secondary"
                >
                  Add Warehouse
                </button>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tax Rules</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Name
                    </label>
                    <input
                      type="text"
                      value={formData.taxRules.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        taxRules: { ...formData.taxRules, name: e.target.value }
                      })}
                      className="input-field"
                      placeholder="e.g., VAT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.taxRules.rate}
                      onChange={(e) => setFormData({
                        ...formData,
                        taxRules: { ...formData.taxRules, rate: parseFloat(e.target.value) }
                      })}
                      className="input-field"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Company Setup Wizard</h1>
        <p className="text-gray-600">Configure your company's structure and settings</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'border-primary-500 text-primary-500' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button className="btn-primary flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Complete Setup</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
