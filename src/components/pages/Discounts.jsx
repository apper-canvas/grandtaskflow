import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import discountService from '@/services/api/discountService';
import DiscountCard from '@/components/molecules/DiscountCard';
import FilterTabs from '@/components/molecules/FilterTabs';
import EmptyState from '@/components/organisms/EmptyState';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await discountService.getAll();
      setDiscounts(result);
    } catch (err) {
      setError(err.message || 'Failed to load discounts');
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  useEffect(() => {
    let filtered = discounts;

    // Filter by category
    if (activeFilter !== 'all') {
      if (activeFilter === 'active') {
        // Show only non-expired discounts
        const now = new Date();
        filtered = filtered.filter(discount => 
          new Date(discount.expiryDate) > now
        );
      } else {
        // Filter by specific category
        filtered = filtered.filter(discount => 
          discount.category.toLowerCase() === activeFilter.toLowerCase()
        );
      }
    }

    // Sort by expiry date (soonest first)
    filtered.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    setFilteredDiscounts(filtered);
  }, [discounts, activeFilter]);

  // Get unique categories for filter tabs
  const categories = [...new Set(discounts.map(d => d.category))];
const activeDiscounts = discounts.filter(d => new Date(d.expiry_date) > new Date());

  const filterTabs = [
    { 
      value: 'all', 
      label: 'All Deals', 
      icon: 'Tag',
      count: discounts.length 
    },
    { 
      value: 'active', 
      label: 'Active', 
      icon: 'Clock',
      count: activeDiscounts.length 
    },
    ...categories.map(category => ({
      value: category.toLowerCase(),
      label: category,
      icon: category === 'Office' ? 'Briefcase' : 
            category === 'Software' ? 'Monitor' :
            category === 'Training' ? 'GraduationCap' :
            category === 'Furniture' ? 'Armchair' : 'Package',
      count: discounts.filter(d => d.category === category).length
    }))
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-surface-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-64 mb-6"></div>
          <div className="h-10 bg-surface-200 rounded-lg w-80 mb-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} type="discount" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <ErrorState 
          message={error}
          onRetry={loadDiscounts}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-surface-900 mb-2">
          Exclusive Discounts
        </h1>
        <p className="text-surface-600 mb-6">
          Save money on business tools and resources with these special offers
        </p>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
        />
      </div>

      {/* Stats Banner */}
      {activeFilter === 'all' && activeDiscounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-6 mb-8 border border-accent/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-surface-900 mb-1">
                🎉 {activeDiscounts.length} Active Deal{activeDiscounts.length === 1 ? '' : 's'} Available
              </h3>
              <p className="text-surface-600">
                Don't miss out on these limited-time offers for your business needs
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="text-3xl font-bold text-accent">
                💰
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Discount Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDiscounts.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="Tag"
                title={
                  activeFilter === 'active' 
                    ? 'No active discounts' 
                    : activeFilter === 'all'
                    ? 'No discounts available'
                    : `No ${activeFilter} discounts`
                }
                description={
                  activeFilter === 'active'
                    ? 'All current discounts have expired. Check back soon for new deals!'
                    : activeFilter === 'all'
                    ? 'We\'re working on bringing you exclusive discounts and deals'
                    : `No discounts available in the ${activeFilter} category right now`
                }
              />
            </div>
          ) : (
            filteredDiscounts.map((discount, index) => (
              <motion.div
                key={discount.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <DiscountCard discount={discount} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      {filteredDiscounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-surface-500"
        >
          <p>
            💡 Tip: Copy discount codes and use them at checkout to save on your business purchases
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Discounts;