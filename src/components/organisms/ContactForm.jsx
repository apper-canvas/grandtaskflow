import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Modal from '@/components/molecules/Modal';

const ContactForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  contact = null, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
if (contact) {
      setFormData({
        name: contact.Name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        role: contact.role || '',
        department: contact.department || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: ''
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
      toast.success(contact ? 'Contact updated successfully!' : 'Contact created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save contact');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Operations',
    'HR',
    'Finance'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact ? 'Edit Contact' : 'Add New Contact'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter full name"
          icon="User"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
          icon="Mail"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="Enter phone number"
          icon="Phone"
          required
        />

        <Input
          label="Job Role"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
          error={errors.role}
          placeholder="Enter job role"
          icon="Briefcase"
          required
        />

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Department <span className="text-error">*</span>
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className={`w-full h-12 px-3 rounded-lg border-2 transition-all duration-200 ${
              errors.department
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                : 'border-surface-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
            } focus:outline-none bg-white text-surface-900`}
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <div className="flex items-center mt-1 text-sm text-error">
              {errors.department}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {contact ? 'Update Contact' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactForm;