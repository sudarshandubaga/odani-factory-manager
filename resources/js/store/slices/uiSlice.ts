import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    isLoading: boolean;
    loadingText?: string;
}

const initialState: UIState = {
    isLoading: false,
    loadingText: "Loading...",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setLoadingText: (state, action: PayloadAction<string>) => {
            state.loadingText = action.payload;
        },
    },
});

export const { setLoading, setLoadingText } = uiSlice.actions;
export default uiSlice.reducer;
