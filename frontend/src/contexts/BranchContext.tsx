import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
import { Branch } from '../types';
import toast from 'react-hot-toast';

interface BranchContextType {
  selectedBranch: Branch | null;
  branches: Branch[];
  loading: boolean;
  selectBranch: (branch: Branch | null) => void;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Load branches when user changes
  useEffect(() => {
    const loadBranches = async () => {
      if (!user?.company?.id) {
        setBranches([]);
        setSelectedBranch(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadedBranches = await apiService.getBranches(user.company.id);
        setBranches(loadedBranches);

        // Try to restore previously selected branch from localStorage
        const savedBranchId = localStorage.getItem(`selectedBranch_${user.company.id}`);
        if (savedBranchId) {
          const savedBranch = loadedBranches.find(b => b.id === savedBranchId);
          if (savedBranch) {
            setSelectedBranch(savedBranch);
          } else {
            // If saved branch not found, select first branch
            setSelectedBranch(loadedBranches[0] || null);
          }
        } else {
          // Auto-select first branch if none selected
          setSelectedBranch(loadedBranches[0] || null);
        }
      } catch (error) {
        console.error('Failed to load branches:', error);
        toast.error('Failed to load branches');
        setBranches([]);
        setSelectedBranch(null);
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, [user?.company?.id]);

  const selectBranch = (branch: Branch | null) => {
    setSelectedBranch(branch);
    if (branch && user?.company?.id) {
      localStorage.setItem(`selectedBranch_${user.company.id}`, branch.id);
      toast.success(`Switched to ${branch.name}`);
    } else if (user?.company?.id) {
      localStorage.removeItem(`selectedBranch_${user.company.id}`);
    }
  };

  const refreshBranches = async () => {
    if (!user?.company?.id) return;

    try {
      const loadedBranches = await apiService.getBranches(user.company.id);
      setBranches(loadedBranches);

      // If current branch is still in the list, keep it selected
      if (selectedBranch) {
        const stillExists = loadedBranches.find(b => b.id === selectedBranch.id);
        if (!stillExists) {
          setSelectedBranch(loadedBranches[0] || null);
        }
      }
    } catch (error) {
      console.error('Failed to refresh branches:', error);
      toast.error('Failed to refresh branches');
    }
  };

  const value: BranchContextType = {
    selectedBranch,
    branches,
    loading,
    selectBranch,
    refreshBranches,
  };

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};

