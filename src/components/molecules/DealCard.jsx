import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const DealCard = ({ deal, onEdit, onDelete }) => {
  // Helper function to copy text to clipboard
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  // Helper function to initiate phone call
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'qualified':
        return 'blue';
      case 'proposal':
        return 'yellow';
      case 'negotiation':
        return 'orange';
      case 'closed-won':
        return 'green';
      case 'closed-lost':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'AlertTriangle';
      case 'medium':
        return 'Minus';
      case 'low':
        return 'ArrowDown';
      default:
        return 'Circle';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-surface-200 hover:border-primary/20">
      <div className="p-6 h-full flex flex-col">
        {/* Header with Name and Amount */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-surface-900 mb-1 truncate">
              {deal.Name}
            </h3>
            <div className="text-2xl font-bold text-primary mb-2">
              {formatCurrency(deal.amount || 0)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <Badge 
              variant={getStatusColor(deal.status)}
              size="sm"
            >
              {deal.status?.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge 
              variant={getPriorityColor(deal.priority)}
              size="sm"
            >
              <ApperIcon name={getPriorityIcon(deal.priority)} size={12} />
              {deal.priority?.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Company and Contact Info */}
        <div className="space-y-3 mb-4 flex-1">
          {deal.company && (
            <div className="flex items-center text-sm text-surface-600">
              <ApperIcon name="Building" size={16} className="mr-2 text-surface-400" />
              <span className="truncate">{deal.company}</span>
            </div>
          )}
          
          {deal.contactPerson && (
            <div className="flex items-center text-sm text-surface-600">
              <ApperIcon name="User" size={16} className="mr-2 text-surface-400" />
              <span className="truncate">{deal.contactPerson}</span>
            </div>
          )}

          {/* Phone Number with Click-to-Call */}
          {deal.phone && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-surface-600 min-w-0 flex-1">
                <ApperIcon name="Phone" size={16} className="mr-2 text-surface-400 flex-shrink-0" />
                <span className="truncate">{deal.phone}</span>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => handleCall(deal.phone)}
                  className="p-1 rounded hover:bg-surface-100 text-green-600 hover:text-green-700 transition-colors"
                  title="Call"
                >
                  <ApperIcon name="Phone" size={14} />
                </button>
                <button
                  onClick={() => copyToClipboard(deal.phone, 'Phone number')}
                  className="p-1 rounded hover:bg-surface-100 text-surface-500 hover:text-surface-700 transition-colors"
                  title="Copy phone"
                >
                  <ApperIcon name="Copy" size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Expected Close Date */}
          <div className="flex items-center text-sm text-surface-600">
            <ApperIcon name="Calendar" size={16} className="mr-2 text-surface-400" />
            <span>Close: {formatDate(deal.expectedCloseDate)}</span>
          </div>

          {/* Description */}
          {deal.description && (
            <div className="text-sm text-surface-600">
              <div className="flex items-start">
                <ApperIcon name="FileText" size={16} className="mr-2 mt-0.5 text-surface-400 flex-shrink-0" />
                <p className="line-clamp-2">{deal.description}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {deal.tags && (
            <div className="flex items-center text-sm">
              <ApperIcon name="Tag" size={16} className="mr-2 text-surface-400" />
              <div className="flex flex-wrap gap-1">
                {deal.tags.split(',').slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-surface-100 text-surface-600 rounded text-xs"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-surface-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <ApperIcon name="Edit2" size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DealCard;