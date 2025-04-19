// src/hooks/useUserDetails.js
import {useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {GetUserDetailsUrl} from '../../API';

/**
 * Custom Hook to fetch user details.
 * Manages user data, loading state, and error state.
 * Returns the state values and a function to trigger fetching.
 */
const useUserDetails = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Start false, becomes true during fetch
  const [error, setError] = useState(null); // Stores error object or null

  // The actual fetching logic, wrapped in useCallback
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors on a new fetch attempt
    let userToken = null;

    try {
      userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('useUserDetails: No token found.');
        // Set a specific error state for authentication issues
        setError({type: 'AUTH', message: 'Authentication token not found.'});
        setUser(null); // Ensure user data is cleared
        setLoading(false);
        return null; // Indicate fetch didn't complete successfully
      }

      console.log('useUserDetails: Fetching from:', GetUserDetailsUrl);
      const response = await axios.get(GetUserDetailsUrl, {
        headers: {Authorization: `Bearer ${userToken}`},
        timeout: 10000, // Standard timeout
      });

      // Adjust data access based on your actual API response structure
      const userData = response.data.user || response.data;

      if (userData && typeof userData === 'object') {
        setUser(userData); // Update user state on success
        setError(null); // Clear error on success
        return userData; // Return fetched data
      } else {
        console.error('useUserDetails: Invalid data format:', response.data);
        setError({type: 'DATA_FORMAT', message: 'Invalid user data format.'});
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('useUserDetails: Fetch error:', err);
      setUser(null); // Clear user data on any error

      // Set specific error types for better handling in the component
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError({type: 'AUTH', message: 'Authentication failed.'});
      } else if (err.response) {
        setError({
          type: 'SERVER',
          status: err.response.status,
          message: `Server error (${err.response.status}).`,
          data: err.response.data, // Include response data if available
        });
      } else if (err.request) {
        setError({
          type: 'NETWORK',
          message: 'Network error. Could not connect.',
        });
      } else {
        setError({
          type: 'UNKNOWN',
          message: err.message || 'An unexpected error occurred.',
        });
      }
      return null; // Indicate fetch failed
    } finally {
      setLoading(false); // Always ensure loading is set to false
    }
  }, []); // No dependencies needed if GetUserDetailsUrl is constant

  // Return state values and the fetch function
  return {user, loading, error, fetchDetails};
};

export default useUserDetails;
