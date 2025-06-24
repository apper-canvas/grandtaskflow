export const discountService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "code" } },
          { field: { Name: "discount" } },
          { field: { Name: "expiry_date" } },
          { field: { Name: "category" } },
          { field: { Name: "url" } }
        ]
      };

      const response = await apperClient.fetchRecords('app_discount', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching discounts:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "code" } },
          { field: { Name: "discount" } },
          { field: { Name: "expiry_date" } },
          { field: { Name: "category" } },
          { field: { Name: "url" } }
        ]
      };

      const response = await apperClient.getRecordById('app_discount', parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching discount with ID ${id}:`, error);
      throw error;
    }
  },

  async getByCategory(category) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "code" } },
          { field: { Name: "discount" } },
          { field: { Name: "expiry_date" } },
          { field: { Name: "category" } },
          { field: { Name: "url" } }
        ],
        where: [{
          FieldName: "category",
          Operator: "EqualTo",
          Values: [category]
        }]
      };

      const response = await apperClient.fetchRecords('app_discount', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching discounts by category:", error);
      throw error;
    }
  },

  async getActive() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "code" } },
          { field: { Name: "discount" } },
          { field: { Name: "expiry_date" } },
          { field: { Name: "category" } },
          { field: { Name: "url" } }
        ],
        where: [{
          FieldName: "expiry_date",
          Operator: "GreaterThan",
          Values: [new Date().toISOString().split('T')[0]]
        }]
      };

      const response = await apperClient.fetchRecords('app_discount', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching active discounts:", error);
      throw error;
    }
  }
};

export default discountService;