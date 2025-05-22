import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const fetchCategories = createAsyncThunk(
    'menu/fetchCategories',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_URL}/menu/categories`);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

export const fetchMenuItems = createAsyncThunk(
    'menu/fetchMenuItems',
    async (categoryId, { rejectWithValue }) => {
      try {
        const url = categoryId
            ? `${API_URL}/menu/items/category/${categoryId}`
            : `${API_URL}/menu/items`;
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

const initialState = {
  categories: [],
  menuItems: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
        // Fetch Categories
        .addCase(fetchCategories.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchCategories.fulfilled, (state, action) => {
          state.loading = false;
          state.categories = action.payload;
        })
        .addCase(fetchCategories.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to load categories';
        })
        // Fetch Menu Items
        .addCase(fetchMenuItems.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchMenuItems.fulfilled, (state, action) => {
          state.loading = false;
          state.menuItems = action.payload;
        })
        .addCase(fetchMenuItems.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to load menu items';
        });
  },
});

export const { setSelectedCategory, clearError } = menuSlice.actions;
export default menuSlice.reducer;
