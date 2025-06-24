import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import taskService from '@/services/api/taskService';
import Button from '@/components/atoms/Button';
import TaskCard from '@/components/molecules/TaskCard';
import SearchBar from '@/components/molecules/SearchBar';
import FilterTabs from '@/components/molecules/FilterTabs';
import TaskForm from '@/components/organisms/TaskForm';
import EmptyState from '@/components/organisms/EmptyState';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await taskService.getAll();
      setTasks(result);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    let filtered = tasks;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(task => task.status === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by priority and due date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
}
      return new Date(a.due_date) - new Date(b.due_date);
    });

    setFilteredTasks(filtered);
  }, [tasks, activeFilter, searchTerm]);

  const handleCreateTask = async (taskData) => {
    setTaskLoading(true);
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleUpdateTask = async (taskData) => {
    setTaskLoading(true);
    try {
      const updatedTask = await taskService.update(editingTask.Id, taskData);
      setTasks(prev => prev.map(task => 
        task.Id === updatedTask.Id ? updatedTask : task
      ));
      setEditingTask(null);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleToggleStatus = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleStatus(taskId);
      setTasks(prev => prev.map(task => 
        task.Id === updatedTask.Id ? updatedTask : task
      ));
      
      if (updatedTask.status === 'completed') {
        toast.success('Task completed! Great job! 🎉');
      } else {
        toast.info('Task marked as active');
      }
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const filterTabs = [
    { 
      value: 'all', 
      label: 'All Tasks', 
      icon: 'List',
      count: tasks.length 
    },
    { 
      value: 'active', 
      label: 'Active', 
      icon: 'Clock',
      count: tasks.filter(t => t.status === 'active').length 
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: 'CheckCircle',
      count: tasks.filter(t => t.status === 'completed').length 
    }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-surface-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-64 mb-6"></div>
          <div className="h-12 bg-surface-200 rounded-lg w-full mb-6"></div>
          <div className="h-10 bg-surface-200 rounded-lg w-80"></div>
        </div>
        <SkeletonLoader count={5} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorState 
          message={error}
          onRetry={loadTasks}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-surface-900 mb-2">
          My Tasks
        </h1>
        <p className="text-surface-600 mb-6">
          Stay organized and productive with your task management
        </p>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <SearchBar
            placeholder="Search tasks..."
            onSearch={setSearchTerm}
            className="sm:max-w-md"
          />
          
          <Button 
            onClick={() => setShowTaskForm(true)}
            icon="Plus"
          >
            Create Task
          </Button>
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
        />
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={searchTerm ? 'Search' : activeFilter === 'completed' ? 'CheckCircle' : 'CheckSquare'}
              title={
                searchTerm 
                  ? 'No tasks found' 
                  : activeFilter === 'completed' 
                  ? 'No completed tasks yet' 
                  : 'No tasks yet'
              }
              description={
                searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : activeFilter === 'completed'
                  ? 'Complete some tasks to see them here'
                  : 'Create your first task to get started with your productivity journey'
              }
              actionLabel={!searchTerm ? 'Create Your First Task' : undefined}
              onAction={!searchTerm ? () => setShowTaskForm(true) : undefined}
            />
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <TaskCard
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        loading={taskLoading}
      />
    </div>
  );
};

export default Tasks;