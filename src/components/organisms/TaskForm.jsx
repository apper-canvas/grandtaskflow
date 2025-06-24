import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Modal from '@/components/molecules/Modal';

const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task = null, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.due_date || '',
        priority: task.priority || 'medium'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium'
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
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
      toast.success(task ? 'Task updated successfully!' : 'Task created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save task');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Task Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="Enter task title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border-2 border-surface-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
            placeholder="Enter task description (optional)"
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          error={errors.dueDate}
          required
        />

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['low', 'medium', 'high'].map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => handleChange('priority', priority)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  formData.priority === priority
                    ? priority === 'low' 
                      ? 'border-surface-400 bg-surface-50 text-surface-700'
                      : priority === 'medium'
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-surface-300 hover:border-surface-400'
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
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
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;