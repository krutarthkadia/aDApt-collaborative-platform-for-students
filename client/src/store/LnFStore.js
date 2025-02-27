import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore.js";

export const useLnFStore = create((set, get) => ({
  places: [],
  lostMessages: [],
  foundMessages: [],
  isLoading: false,
  what: "",
  qId: "",
  replies: [],
  setWhat: (value) => set({ what: value }),
  setQId: (value) => set({ qId: value }),
  // setPlaces: (value) => set({ places: value }),
  // setQuestions: (value) => set({ replys: value }),
  // setAnswers: (value) => set({ answers: value }),
  // setIsLoading: (value) => set({ isLoading: value }),

  // Fetch the list of places
  getPlaces: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/lnf/places");
      set({ places: res.data });
      console.log(get().places);

    } catch (error) {
      toast.error("Failed to fetch places.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new place
  addPlace: async (placeData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/lnf/places/add", placeData);
      set((state) => ({ places: [...state.places, res.data] }));
      toast.success("Place added successfully.");
    } catch (error) {
      toast.error("Failed to add place.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove a place
  removePlace: async (placeId) => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete(`/lnf/places/${placeId}/remove`);

      set((state) => ({
        places: state.places.filter((place) => place !== placeId), // Correct return statement
      }));
      console.log(get().places)
      toast.success("Place removed successfully.");
    } catch (error) {
      toast.error("Failed to remove place.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch lost messages for a specific place
  getLostMessages: async (placeId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/lnf/places/${placeId}/messages/lost`);
      set({ lostMessages: res.data });
    } catch (error) {
      toast.error("Failed to fetch lost messages.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch found messages for a specific place
  getFoundMessages: async (placeId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/lnf/places/${placeId}/messages/found`);
      set({ foundMessages: res.data });
    } catch (error) {
      toast.error("Failed to fetch found messages.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Send a lost message
  sendLostMessage: async (placeId, messageData) => {
    try {
      const res = await axiosInstance.post(
        `/lnf/places/${placeId}/messages/lost`,
        messageData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set((state) => ({
        lostMessages: [...state.lostMessages, res.data],
      }));
      toast.success("Lost message sent successfully.");
    } catch (error) {
      toast.error("Failed to send lost message.");
    }
  },

  // Send a found message
  sendFoundMessage: async (placeId, messageData) => {
    try {
      const res = await axiosInstance.post(`/lnf/places/${placeId}/messages/found`, messageData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      set((state) => ({
        foundMessages: [...state.foundMessages, res.data],
      }));
      toast.success("Found message sent successfully.");
    } catch (error) {
      toast.error("Failed to send found message.");
    }
  },

  // Delete a lost message
  deleteLostMessage: async (placeId, messageId) => {
    try {
      await axiosInstance.delete(`/lnf/places/${placeId}/messages/lost/${messageId}`);
      set((state) => ({
        lostMessages: state.lostMessages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Lost message deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete lost message.");
    }
  },

  // Delete a found message
  deleteFoundMessage: async (placeId, messageId) => {
    try {
      await axiosInstance.delete(`/lnf/places/${placeId}/messages/found/${messageId}`);
      set((state) => ({
        foundMessages: state.foundMessages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Found message deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete found message.");
    }
  },

  getReplies: async (place, msgId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post(`/lnf/places/${place}/replies`, {
        msgId,
      });
      set({ replies: res.data });
      console.log("data")
      console.log(res.data)
    } catch (error) {
      toast.error("Failed to fetch answers.");
    } finally {
      set({ isLoading: false });
    }
  },

  sendReply: async (place, replyData) => {
    try {
      console.log("IT's a qdata")
      console.log(replyData.text)
      console.log(replyData.image)
      const res = await axiosInstance.post(
        `/lnf/places/${place}/reply`,
        replyData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set((state) => ({
        replies: [...state.replies, res.data],
      }));
      toast.success("Question sent successfully.");
    } catch (error) {
      toast.error("Failed to send reply.");
    }
  },


  // Connect socket for real-time updates
  connectSocket: () => {
    const { authUser } = useAuthStore.getState();
    const { socket } = useAuthStore.getState(); // Access shared socket instance from Auth store
    if (!socket) return;

    // Listen for real-time updates for LnF
    // socket.on("newLostMessage", (data) => {
    //   set((state) => ({
    //     lostMessages: [...state.lostMessages, data],
    //   }));
    // });

    // socket.on("newFoundMessage", (data) => {
    //   set((state) => ({
    //     foundMessages: [...state.foundMessages, data],
    //   }));
    // });

    socket.on("newReply", ({ msgId, newReply }) => {
      console.log(authUser._id)
      console.log(newReply)
      if ((newReply.senderId !== authUser._id) && (get().qId === msgId)) {
        set((state) => ({
          replies: [...state.replies, newReply], // Correctly update the answers array
        }));
        console.log("broadcasted");
      }
    });
  },

  dissconnectSocket: () => {
    const { socket } = useAuthStore.getState(); // Access shared socket instance from Auth store
    if (!socket) return;
    socket.off("newReply")
  }
}));
