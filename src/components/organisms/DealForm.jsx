import { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';

const DealForm = ({ deal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    Name: '',
    phone: '',
    amount: '',
    status: 'qualified',
    priority: 'medium',
    company: '',
    contactPerson: '',
    email: '',
    expectedCloseDate: '',
    description: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (deal) {
      setFormData({
        Name: deal.Name || '',
        phone: deal.phone || '',
        amount: deal.amount || '',
        status: deal.status || 'qualified',
        priority: deal.priority || 'medium',
        company: deal.company || '',
        contactPerson: deal.contactPerson || '',
        email: deal.email || '',
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
        description: deal.description || '',
        tags: deal.tags || ''
      });
    }
  }, [deal]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.Name.trim()) {
      newErrors.Name = 'Deal name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Basic phone validation
      const phoneRegex = /^[\+]?[\d\s\-\(\)\.]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Email validation (if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Amount validation (if provided)
    if (formData.amount && formData.amount !== '') {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount < 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
    }

    // Expected close date validation (should be in the future)
    if (formData.expectedCloseDate) {
      const closeDate = new Date(formData.expectedCloseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (closeDate < today) {
        newErrors.expectedCloseDate = 'Expected close date should be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        tags: formData.tags ? formData.tags.trim() : '',
        expectedCloseDate: formData.expectedCloseDate || null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'In Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Deal Name */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Deal Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={formData.Name}
          onChange={(e) => handleInputChange('Name', e.target.value)}
          placeholder="Enter deal name"
          error={errors.Name}
          disabled={loading}
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="e.g., +1 (555) 123-4567"
          error={errors.phone}
          disabled={loading}
        />
        <p className="mt-1 text-xs text-surface-500">
          Include country code if international. Format: +1 (555) 123-4567
        </p>
      </div>

      {/* Amount and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Deal Amount ($)
          </label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            error={errors.amount}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority and Expected Close Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Expected Close Date
          </label>
          <Input
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
            error={errors.expectedCloseDate}
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Company and Contact Person Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Company
          </label>
          <Input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Company name"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Contact Person
          </label>
          <Input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            placeholder="Contact person name"
            disabled={loading}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Email
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="contact@company.com"
          error={errors.email}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the deal, requirements, or any important notes..."
          rows={4}
          className="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-50 disabled:cursor-not-allowed resize-none"
          disabled={loading}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Tags
        </label>
        <Input
          type="text"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="enterprise, software, annual (comma-separated)"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-surface-500">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-surface-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary-dark text-white"
        >
          {loading ? (
            <>
              <ApperIcon name="Loader2" size={16} className="animate-spin" />
              {deal ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <ApperIcon name={deal ? 'Save' : 'Plus'} size={16} />
              {deal ? 'Update Deal' : 'Create Deal'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;