import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Checkbox from '@/components/atoms/Checkbox';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const TaskCard = ({ 
  task, 
  onToggleStatus, 
  onEdit, 
  onDelete,
  loading = false 
}) => {
  const isCompleted = task.status === 'completed';
  const isOverdue = new Date(task.dueDate) < new Date() && !isCompleted;

  const handleToggle = async () => {
    if (loading) return;
    await onToggleStatus(task.Id);
  };

  const priorityColors = {
    low: 'low',
    medium: 'medium', 
    high: 'high'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className={`p-4 ${isCompleted ? 'opacity-75' : ''}`}>
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-0.5">
            <Checkbox
              checked={isCompleted}
              onChange={handleToggle}
              disabled={loading}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-surface-900 ${isCompleted ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                <p className="text-sm text-surface-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Edit2"
                  onClick={() => onEdit(task)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Trash2"
                  onClick={() => onDelete(task.Id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error"
                />
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Badge variant={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                
<div className={`flex items-center text-sm ${
                  isOverdue ? 'text-error' : 'text-surface-500'
                }`}>
                  <ApperIcon 
                    name={isOverdue ? 'AlertCircle' : 'Calendar'} 
                    size={14} 
                    className="mr-1" 
                  />
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </div>
              </div>

              {isCompleted && (
                <div className="flex items-center text-sm text-success">
                  <ApperIcon name="CheckCircle" size={14} className="mr-1" />
                  Completed
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TaskCard;