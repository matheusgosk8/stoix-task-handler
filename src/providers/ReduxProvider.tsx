'use client';

import { Provider } from 'react-redux';
import { store, persistor } from '@/lib/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
            {children}
        </PersistGate>
    </Provider>;
}
