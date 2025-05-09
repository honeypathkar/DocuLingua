// src/store/userStore.js
import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {GetUserDetailsUrl} from '../../API';

const useUserStore = create(
  immer(set => ({
    user: null,
    loading: false,
    error: null,

    fetchDetails: async () => {
      set(state => {
        state.loading = true;
        state.error = null;
      });

      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          console.log('userStore: No token found.');
          set(state => {
            state.error = {
              type: 'AUTH',
              message: 'Authentication token not found.',
            };
            state.user = null;
            state.loading = false;
          });
          return null;
        }

        console.log('userStore: Fetching from:', GetUserDetailsUrl);
        const response = await axios.get(GetUserDetailsUrl, {
          headers: {Authorization: `Bearer ${userToken}`},
          timeout: 10000,
        });

        const userData = response.data.user || response.data;

        if (userData && typeof userData === 'object') {
          set(state => {
            state.user = userData;
            state.error = null;
          });
          return userData;
        } else {
          console.error('userStore: Invalid data format:', response.data);
          set(state => {
            state.user = null;
            state.error = {
              type: 'DATA_FORMAT',
              message: 'Invalid user data format.',
            };
          });
          return null;
        }
      } catch (err) {
        console.error('userStore: Fetch error:', err);
        set(state => {
          state.user = null;
          if (
            err.response &&
            (err.response.status === 401 || err.response.status === 403)
          ) {
            state.error = {type: 'AUTH', message: 'Authentication failed.'};
          } else if (err.response) {
            state.error = {
              type: 'SERVER',
              status: err.response.status,
              message: `Server error (${err.response.status}).`,
              data: err.response.data,
            };
          } else if (err.request) {
            state.error = {
              type: 'NETWORK',
              message: 'Network error. Could not connect.',
            };
          } else {
            state.error = {
              type: 'UNKNOWN',
              message: err.message || 'An unexpected error occurred.',
            };
          }
        });
        return null;
      } finally {
        set(state => {
          state.loading = false;
        });
      }
    },
  })),
);

export default useUserStore;
