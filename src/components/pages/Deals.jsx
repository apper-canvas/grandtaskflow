import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import dealService from '@/services/api/dealService';
import DealCard from '@/components/molecules/DealCard';
import DealForm from '@/components/organisms/DealForm';
import FilterTabs from '@/components/molecules/FilterTabs';
import SearchBar from '@/components/molecules/SearchBar';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/organisms/EmptyState';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import ApperIcon from '@/components/ApperIcon';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [stats, setStats] = useState(null);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealsResult, statsResult] = await Promise.all([
        dealService.getAll(),
        dealService.getStats()
      ]);
      setDeals(dealsResult);
      setStats(statsResult);
    } catch (err) {
      setError(err.message || 'Failed to load deals');
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      return;
    }
    
    try {
      const results = await dealService.search(query);
      // Apply current filter to search results
      let filtered = results;
      if (activeFilter !== 'all') {
        if (activeFilter === 'high-value') {
          filtered = filtered.filter(deal => deal.amount >= 50000);
        } else if (activeFilter === 'closing-soon') {
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          filtered = filtered.filter(deal => 
            deal.expectedCloseDate && new Date(deal.expectedCloseDate) <= thirtyDaysFromNow
          );
        } else {
          filtered = filtered.filter(deal => 
            deal.status === activeFilter || deal.priority === activeFilter
          );
        }
      }
      setFilteredDeals(filtered);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Search failed');
    }
  }, [activeFilter]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    let filtered = deals;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      return; // Search results already filtered
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'high-value') {
        filtered = filtered.filter(deal => deal.amount >= 50000);
      } else if (activeFilter === 'closing-soon') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        filtered = filtered.filter(deal => 
          deal.expectedCloseDate && new Date(deal.expectedCloseDate) <= thirtyDaysFromNow
        );
      } else {
        filtered = filtered.filter(deal => 
          deal.status === activeFilter || deal.priority === activeFilter
        );
      }
    }

    // Sort by amount (highest first)
    filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));

    setFilteredDeals(filtered);
  }, [deals, activeFilter, searchQuery]);

  const handleCreateDeal = async (dealData) => {
    try {
      const newDeal = await dealService.create(dealData);
      setDeals(prev => [newDeal, ...prev]);
      setShowCreateModal(false);
      toast.success('Deal created successfully');
    } catch (err) {
      console.error('Create deal error:', err);
      toast.error(err.message || 'Failed to create deal');
    }
  };

  const handleEditDeal = async (id, dealData) => {
    try {
      const updatedDeal = await dealService.update(id, dealData);
      setDeals(prev => prev.map(deal => 
        deal.Id === parseInt(id, 10) ? updatedDeal : deal
      ));
      setShowEditModal(false);
      setSelectedDeal(null);
      toast.success('Deal updated successfully');
    } catch (err) {
      console.error('Update deal error:', err);
      toast.error(err.message || 'Failed to update deal');
    }
  };

  const handleDeleteDeal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) {
      return;
    }

    try {
      await dealService.delete(id);
      setDeals(prev => prev.filter(deal => deal.Id !== parseInt(id, 10)));
      toast.success('Deal deleted successfully');
    } catch (err) {
      console.error('Delete deal error:', err);
      toast.error(err.message || 'Failed to delete deal');
    }
  };

  const openEditModal = (deal) => {
    setSelectedDeal(deal);
    setShowEditModal(true);
  };

  // Generate filter tabs based on data
  const statusCounts = stats?.statusCounts || {};
  const priorityCounts = stats?.priorityCounts || {};
  const highValueDeals = deals.filter(d => d.amount >= 50000).length;
  const closingSoonDeals = deals.filter(d => {
    if (!d.expectedCloseDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(d.expectedCloseDate) <= thirtyDaysFromNow;
  }).length;

  const filterTabs = [
    { 
      value: 'all', 
      label: 'All Deals', 
      icon: 'Briefcase',
      count: deals.length 
    },
    { 
      value: 'qualified', 
      label: 'Qualified', 
      icon: 'CheckCircle',
      count: statusCounts.qualified || 0
    },
    { 
      value: 'proposal', 
      label: 'Proposal', 
      icon: 'FileText',
      count: statusCounts.proposal || 0
    },
    { 
      value: 'negotiation', 
      label: 'Negotiation', 
      icon: 'MessageSquare',
      count: statusCounts.negotiation || 0
    },
    { 
      value: 'high', 
      label: 'High Priority', 
      icon: 'AlertTriangle',
      count: priorityCounts.high || 0
    },
    { 
      value: 'high-value', 
      label: 'High Value ($50K+)', 
      icon: 'DollarSign',
      count: highValueDeals
    },
    { 
      value: 'closing-soon', 
      label: 'Closing Soon', 
      icon: 'Clock',
      count: closingSoonDeals
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-surface-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-64 mb-6"></div>
          <div className="h-10 bg-surface-200 rounded-lg w-80 mb-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} type="deal" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <ErrorState 
          message={error}
          onRetry={loadDeals}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-surface-900 mb-2">
              Deal Pipeline
            </h1>
            <p className="text-surface-600">
              Manage your sales opportunities and track deal progress
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <ApperIcon name="Plus" size={20} />
            Add Deal
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Deals</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalDeals}</p>
                </div>
                <ApperIcon name="Briefcase" size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${stats.totalValue.toLocaleString()}
                  </p>
                </div>
                <ApperIcon name="DollarSign" size={24} className="text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Average Value</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${Math.round(stats.averageValue).toLocaleString()}
                  </p>
                </div>
                <ApperIcon name="TrendingUp" size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">High Priority</p>
                  <p className="text-2xl font-bold text-orange-900">{priorityCounts.high || 0}</p>
                </div>
                <ApperIcon name="AlertTriangle" size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search deals by name, company, contact, phone, or description..."
            className="w-full max-w-lg"
          />
          
          <FilterTabs
            tabs={filterTabs}
            activeTab={activeFilter}
            onTabChange={setActiveFilter}
          />
        </div>
      </div>

      {/* Deal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDeals.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="Briefcase"
                title={
                  searchQuery 
                    ? 'No deals found' 
                    : activeFilter === 'all'
                    ? 'No deals yet'
                    : `No ${activeFilter.replace('-', ' ')} deals`
                }
                description={
                  searchQuery
                    ? `No deals match "${searchQuery}". Try a different search term.`
                    : activeFilter === 'all'
                    ? 'Start by creating your first deal to track sales opportunities'
                    : `No deals found for the selected filter. Try a different filter or create a new deal.`
                }
                action={
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    <ApperIcon name="Plus" size={16} />
                    Create Deal
                  </Button>
                }
              />
            </div>
          ) : (
            filteredDeals.map((deal, index) => (
              <motion.div
                key={deal.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <DealCard 
                  deal={deal}
                  onEdit={() => openEditModal(deal)}
                  onDelete={() => handleDeleteDeal(deal.Id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create Deal Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Deal"
        size="lg"
      >
        <DealForm
          onSubmit={handleCreateDeal}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDeal(null);
        }}
        title="Edit Deal"
        size="lg"
      >
        {selectedDeal && (
          <DealForm
            deal={selectedDeal}
            onSubmit={(data) => handleEditDeal(selectedDeal.Id, data)}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedDeal(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Deals;