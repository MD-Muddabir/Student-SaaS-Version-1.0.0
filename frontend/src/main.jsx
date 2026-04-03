/**
 * Main Entry Point
 * Renders the React application
 * ✅ Phase 4.1: React Query for automatic API response caching
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

// ✅ Phase 4.1: Global React Query client configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,      // 5 minutes: data is "fresh" for 5 min
            gcTime: 10 * 60 * 1000,         // 10 minutes: keep in memory for 10 min
            refetchOnWindowFocus: false,     // Don't refetch when tab regains focus
            refetchOnReconnect: true,        // Do refetch when network reconnects
            retry: 1,                        // Only retry failed requests once
        },
        mutations: {
            retry: 0,                        // Don't retry failed mutations
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);

