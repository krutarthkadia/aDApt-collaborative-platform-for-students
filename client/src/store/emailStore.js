import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useEmailStore = create((set, get) => ({
  categories: [],
  emails: [],
  isLoading: false,

  // Fetch all categories
  getCategories: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/mail/categories");
      set({ categories: res.data });
    } catch (error) {
      toast.error("Failed to fetch categories.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch emails for a specific category
  getEmails: async (categoryId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/mail/categories/${categoryId}/emails`);
      set({ emails: res.data });
    } catch (error) {
      toast.error("Failed to fetch emails.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new category
  addCategory: async (name) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/mail/categories/add", { name });
      set((state) => ({ categories: [...state.categories, res.data] }));
      toast.success("Category added successfully.");
    } catch (error) {
      toast.error("Failed to add category.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove a category
  removeCategory: async (categoryId) => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete(`/mail/categories/${categoryId}/remove`);
      set((state) => ({
        categories: state.categories.filter((category) => category._id !== categoryId),
      }));
      toast.success("Category removed successfully.");
    } catch (error) {
      toast.error("Failed to remove category.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add an email to a specific category
  addEmail: async (categoryId, emailData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post(
        `/mail/categories/${categoryId}/emails/add`,
        emailData
      );
      set((state) => ({
        emails: [...state.emails, res.data],
        categories: state.categories.map((category) =>
          category._id === categoryId
            ? { ...category, emails: [...category.emails, res.data] }
            : category
        ),
      }));
      toast.success("Email added successfully.");
    } catch (error) {
      toast.error("Failed to add email.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove an email
  removeEmail: async (categoryId, emailId) => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete(
        `/mail/categories/${categoryId}/emails/${emailId}/remove`
      );
      set((state) => ({
        emails: state.emails.filter((email) => email._id !== emailId),
        categories: state.categories.map((category) =>
          category._id === categoryId
            ? {
                ...category,
                emails: category.emails.filter((email) => email._id !== emailId),
              }
            : category
        ),
      }));
      toast.success("Email removed successfully.");
    } catch (error) {
      toast.error("Failed to remove email.");
    } finally {
      set({ isLoading: false });
    }
  },
}));
