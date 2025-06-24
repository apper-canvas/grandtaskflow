import mockDeals from '@/services/mockData/deals.json';

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for deals (simulates database)
let deals = [...mockDeals];
let nextId = Math.max(...deals.map(d => d.Id)) + 1;

export const dealService = {
  async getAll() {
    try {
      await delay(300);
      return [...deals];
    } catch (error) {
      console.error("Error fetching deals:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      await delay(200);
      const dealId = parseInt(id, 10);
      const deal = deals.find(d => d.Id === dealId);
      if (!deal) {
        throw new Error(`Deal with ID ${id} not found`);
      }
      return { ...deal };
    } catch (error) {
      console.error(`Error fetching deal with ID ${id}:`, error);
      throw error;
    }
  },

  async getByStatus(status) {
    try {
      await delay(250);
      return deals.filter(deal => 
        deal.status.toLowerCase() === status.toLowerCase()
      ).map(deal => ({ ...deal }));
    } catch (error) {
      console.error("Error fetching deals by status:", error);
      throw error;
    }
  },

  async getByPriority(priority) {
    try {
      await delay(250);
      return deals.filter(deal => 
        deal.priority.toLowerCase() === priority.toLowerCase()
      ).map(deal => ({ ...deal }));
    } catch (error) {
      console.error("Error fetching deals by priority:", error);
      throw error;
    }
  },

  async create(dealData) {
    try {
      await delay(400);
      
      // Validate required fields
      if (!dealData.Name || !dealData.phone) {
        throw new Error('Name and phone are required fields');
      }

      // Create new deal with auto-generated ID
      const newDeal = {
        Id: nextId++,
        Name: dealData.Name,
        phone: dealData.phone,
        amount: dealData.amount || 0,
        status: dealData.status || 'qualified',
        priority: dealData.priority || 'medium',
        company: dealData.company || '',
        contactPerson: dealData.contactPerson || '',
        email: dealData.email || '',
        expectedCloseDate: dealData.expectedCloseDate || '',
        description: dealData.description || '',
        tags: dealData.tags || '',
        createdAt: new Date().toISOString()
      };

      deals.push(newDeal);
      return { ...newDeal };
    } catch (error) {
      console.error("Error creating deal:", error);
      throw error;
    }
  },

  async update(id, dealData) {
    try {
      await delay(350);
      
      const dealId = parseInt(id, 10);
      const index = deals.findIndex(d => d.Id === dealId);
      
      if (index === -1) {
        throw new Error(`Deal with ID ${id} not found`);
      }

      // Update deal with provided data (excluding ID)
      const updatedDeal = {
        ...deals[index],
        ...dealData,
        Id: dealId // Ensure ID doesn't change
      };

      deals[index] = updatedDeal;
      return { ...updatedDeal };
    } catch (error) {
      console.error(`Error updating deal with ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await delay(300);
      
      const dealId = parseInt(id, 10);
      const index = deals.findIndex(d => d.Id === dealId);
      
      if (index === -1) {
        throw new Error(`Deal with ID ${id} not found`);
      }

      const deletedDeal = deals[index];
      deals.splice(index, 1);
      return { ...deletedDeal };
    } catch (error) {
      console.error(`Error deleting deal with ID ${id}:`, error);
      throw error;
    }
  },

  async search(query) {
    try {
      await delay(200);
      
      if (!query || query.trim() === '') {
        return [...deals];
      }

      const searchTerm = query.toLowerCase().trim();
      return deals.filter(deal => 
        deal.Name.toLowerCase().includes(searchTerm) ||
        deal.company.toLowerCase().includes(searchTerm) ||
        deal.contactPerson.toLowerCase().includes(searchTerm) ||
        deal.phone.includes(searchTerm) ||
        deal.email.toLowerCase().includes(searchTerm) ||
        deal.description.toLowerCase().includes(searchTerm) ||
        deal.tags.toLowerCase().includes(searchTerm)
      ).map(deal => ({ ...deal }));
    } catch (error) {
      console.error("Error searching deals:", error);
      throw error;
    }
  },

  async getUpcoming() {
    try {
      await delay(250);
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      return deals.filter(deal => {
        if (!deal.expectedCloseDate) return false;
        const closeDate = new Date(deal.expectedCloseDate);
        return closeDate >= today && closeDate <= thirtyDaysFromNow;
      }).map(deal => ({ ...deal }));
    } catch (error) {
      console.error("Error fetching upcoming deals:", error);
      throw error;
    }
  },

  async getStats() {
    try {
      await delay(200);
      
      const totalDeals = deals.length;
      const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
      const statusCounts = deals.reduce((acc, deal) => {
        acc[deal.status] = (acc[deal.status] || 0) + 1;
        return acc;
      }, {});
      const priorityCounts = deals.reduce((acc, deal) => {
        acc[deal.priority] = (acc[deal.priority] || 0) + 1;
        return acc;
      }, {});

      return {
        totalDeals,
        totalValue,
        statusCounts,
        priorityCounts,
        averageValue: totalDeals > 0 ? totalValue / totalDeals : 0
      };
    } catch (error) {
      console.error("Error fetching deal statistics:", error);
      throw error;
    }
  }
};

export default dealService;