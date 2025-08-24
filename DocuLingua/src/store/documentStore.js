import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {GetDocumentbyUserIdUrl} from '../../API';

const useDocumentStore = create(
  immer((set, get) => ({
    documents: [],
    page: 1,
    limit: 10,
    totalPages: 0,
    totalDocuments: 0,
    loading: false,
    error: null,

    fetchDocuments: async pageNum => {
      const {loading: isLoading, limit} = get();
      if (isLoading) return;

      if (pageNum < 1) pageNum = 1;

      set(state => {
        state.loading = true;
        state.error = null;
      });

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        const response = await axios.get(
          `${GetDocumentbyUserIdUrl}?page=${pageNum}&limit=${limit}`,
          {
            headers: {Authorization: `Bearer ${token}`},
            timeout: 10000,
          },
        );

        const {documents, pagination} = response.data.data;

        set(state => {
          state.documents = documents;
          state.page = pageNum;
          state.totalPages = pagination.totalPages;
          state.totalDocuments = pagination.totalDocuments;
        });
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch documents.';
        set(state => {
          state.error = errorMessage;
        });
        console.error('documentStore: Fetch error:', err);
      } finally {
        set(state => {
          state.loading = false;
        });
      }
    },

    refreshCurrentPage: () => {
      const {page} = get();
      get().fetchDocuments(page);
    },
  })),
);

export default useDocumentStore;
