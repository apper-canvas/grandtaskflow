import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import contactService from '@/services/api/contactService';
import Button from '@/components/atoms/Button';
import ContactCard from '@/components/molecules/ContactCard';
import SearchBar from '@/components/molecules/SearchBar';
import ContactForm from '@/components/organisms/ContactForm';
import EmptyState from '@/components/organisms/EmptyState';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contactService.getAll();
      setContacts(result);
      setFilteredContacts(result);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSearch = useCallback(async (query) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    try {
      const results = await contactService.search(query);
      setFilteredContacts(results);
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback to client-side search
const filtered = contacts.filter(contact =>
        contact.Name?.toLowerCase().includes(query.toLowerCase()) ||
        contact.email?.toLowerCase().includes(query.toLowerCase()) ||
        contact.role?.toLowerCase().includes(query.toLowerCase()) ||
        contact.department?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [contacts]);

  const handleCreateContact = async (contactData) => {
    setContactLoading(true);
    try {
      const newContact = await contactService.create(contactData);
      setContacts(prev => [newContact, ...prev]);
      if (!searchTerm) {
        setFilteredContacts(prev => [newContact, ...prev]);
      }
    } finally {
      setContactLoading(false);
    }
  };

  const handleUpdateContact = async (contactData) => {
    setContactLoading(true);
    try {
      const updatedContact = await contactService.update(editingContact.Id, contactData);
      setContacts(prev => prev.map(contact => 
        contact.Id === updatedContact.Id ? updatedContact : contact
      ));
      setFilteredContacts(prev => prev.map(contact => 
        contact.Id === updatedContact.Id ? updatedContact : contact
      ));
      setEditingContact(null);
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await contactService.delete(contactId);
      setContacts(prev => prev.filter(contact => contact.Id !== contactId));
      setFilteredContacts(prev => prev.filter(contact => contact.Id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleCloseForm = () => {
    setShowContactForm(false);
    setEditingContact(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredContacts(contacts);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-surface-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-surface-200 rounded w-64 mb-6"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 bg-surface-200 rounded-lg w-80"></div>
            <div className="h-10 bg-surface-200 rounded-lg w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} type="contact" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <ErrorState 
          message={error}
          onRetry={loadContacts}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-surface-900 mb-2">
          Team Contacts
        </h1>
        <p className="text-surface-600 mb-6">
          Manage your professional network and team connections
        </p>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SearchBar
            placeholder="Search contacts..."
            onSearch={handleSearch}
            onClear={handleClearSearch}
            className="sm:max-w-md"
          />
          
          <Button 
            onClick={() => setShowContactForm(true)}
            icon="UserPlus"
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Results Info */}
      {searchTerm && (
        <div className="mb-6">
          <p className="text-sm text-surface-600">
            {filteredContacts.length === 0 
              ? 'No contacts found'
              : `Found ${filteredContacts.length} contact${filteredContacts.length === 1 ? '' : 's'}`
            } for "{searchTerm}"
          </p>
        </div>
      )}

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredContacts.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={searchTerm ? 'Search' : 'Users'}
                title={searchTerm ? 'No contacts found' : 'No contacts yet'}
                description={
                  searchTerm 
                    ? 'Try adjusting your search terms or add a new contact'
                    : 'Start building your professional network by adding your first contact'
                }
                actionLabel={searchTerm ? 'Add New Contact' : 'Add Your First Contact'}
                onAction={() => setShowContactForm(true)}
              />
            </div>
          ) : (
            filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ContactCard
                  contact={contact}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={showContactForm}
        onClose={handleCloseForm}
        onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
        contact={editingContact}
        loading={contactLoading}
      />
    </div>
  );
};

export default Contacts;