import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue }) => {
      try {
        const response = await axios.post(`${API_URL}/orders`, orderData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

export const fetchOrders = createAsyncThunk(
    'order/fetchOrders',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_URL}/orders`);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
      try {
        const response = await axios.put(`${API_URL}/orders/${orderId}/status`, null, {
          params: { status }
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

export const fetchTableOrders = createAsyncThunk(
    'order/fetchTableOrders',
    async (tableId, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_URL}/orders/table/${tableId}`);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
        // Create Order
        .addCase(createOrder.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createOrder.fulfilled, (state, action) => {
          state.loading = false;
          state.orders.push(action.payload);
          state.currentOrder = action.payload;
        })
        .addCase(createOrder.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to create order';
        })
        // Fetch Orders
        .addCase(fetchOrders.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchOrders.fulfilled, (state, action) => {
          state.loading = false;
          state.orders = action.payload;
        })
        .addCase(fetchOrders.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to fetch orders';
        })
        // Update Order Status
        .addCase(updateOrderStatus.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateOrderStatus.fulfilled, (state, action) => {
          state.loading = false;
          const index = state.orders.findIndex(order => order.id === action.payload.id);
          if (index !== -1) {
            state.orders[index] = action.payload;
          }
        })
        .addCase(updateOrderStatus.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to update order status';
        })
        // Fetch Table Orders
        .addCase(fetchTableOrders.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchTableOrders.fulfilled, (state, action) => {
          state.loading = false;
          state.orders = action.payload;
        })
        .addCase(fetchTableOrders.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to fetch table orders';
        });
  },
});

export const { setCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
