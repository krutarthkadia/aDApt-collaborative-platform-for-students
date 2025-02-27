import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useSharedLibStore = create((set, get) => ({
  categories: [],
  courses: [],
  files: [],
  isLoading: false,
  isCategories: false,
  isCourses: false,
  isFiles: false,
  catId: (null),
  csId: (null),
  setCatId: (value) => set({ catId: value }),
  setCsId: (value) => set({ csId: value }),

  // Fetch all categories
  getCategories: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/sharedlib/course_codes");
      set({ categories: res.data });
      set({ isCategories: true })
      set({ isCourses: false })
      set({ isFiles: false })
    } catch (error) {
      toast.error("Failed to fetch categories.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch courses for a specific category
  getCourses: async (categoryId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/sharedlib/course_codes/${categoryId}/courses`);
      set({ courses: res.data });
      console.log(get().courses)
      set({ isCategories: false })
      set({ isCourses: true })
      set({ isFiles: false })
    } catch (error) {
      toast.error("Failed to fetch courses.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch files for a specific course
  getFiles: async (categoryId, courseId) => {
    set({ isLoading: true });
    try {
      console.log(categoryId)
      console.log(courseId)
      const res = await axiosInstance.get(
        `/sharedlib/course_codes/${categoryId}/courses/${courseId}/files`
      );
      set({ files: res.data });
      set({ isCategories: false })
      set({ isCourses: false })
      set({ isFiles: true })
    } catch (error) {
      toast.error("Failed to fetch files.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new category
  addCategory: async (category) => {
    set({ isLoading: true });
    try {
      console.log(category)
      const res = await axiosInstance.post("/sharedlib/course_codes/add", { category });
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
      await axiosInstance.post(`/sharedlib/course_codes/${categoryId}/remove`);
      set((state) => ({
        categories: state.categories.filter((category) => category.category !== categoryId),
      }));
      toast.success("Category removed successfully.");
    } catch (error) {
      toast.error("Failed to remove category.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new course
  addCourse: async (categoryId, courseData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post(
        `/sharedlib/course_codes/${categoryId}/courses/add`,
        courseData
      );
      set((state) => ({ courses: [...state.courses, res.data] }));
      console.log(res.data)
      toast.success("Course added successfully.");
    } catch (error) {
      toast.error("Failed to add course.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove a course
  removeCourse: async (categoryId, courseId) => {
    set({ isLoading: true });
    try {
      console.log(courseId)
      await axiosInstance.post(
        `/sharedlib/course_codes/${categoryId}/courses/${courseId}/remove`
      );
      set((state) => ({
        courses: state.courses.filter((course) => course.name !== courseId),
      }));
      toast.success("Course removed successfully.");
    } catch (error) {
      toast.error("Failed to remove course.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new file
  addFile: async (categoryId, courseId, fileData) => {
    set({ isLoading: true });
    try {
        // Create a FormData object
        // const formData = new FormData();
        // formData.append('file', fileData.file); // Assuming fileData.file is a File object
        // formData.append('name', fileData.name); // Append other data as needed
        // // formData.append('fileType', fileData.file.type); // Append the file type
      console.log("File object:", fileData.file);
        const res = await axiosInstance.post(
            `/sharedlib/course_codes/${categoryId}/courses/${courseId}/files/add`,
            fileData,
            
        )
        set((state) => ({ files: [...state.files, res.data] }));
        toast.success("File added successfully.");
    } catch (error) {
        console.error("Failed to add file:", error);
        toast.error("Failed to add file.");
    } finally {
        set({ isLoading: false });
    }
},
  // Remove a file
  removeFile: async (categoryId, courseId, fileId) => {
    set({ isLoading: true });
    try {
      await axiosInstance.post(
        `/sharedlib/course_codes/${categoryId}/courses/${courseId}/files/${fileId}/remove`
      );
      set((state) => ({
        files: state.files.filter((file) => file.name !== fileId),
      }));
      toast.success("File removed successfully.");
    } catch (error) {
      toast.error("Failed to remove file.");
    } finally {
      set({ isLoading: false });
    }
  },
}));
