import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

export const renderWithRouter = (ui, options = {}) => {
    const Wrapper = ({ children }) => (
        <BrowserRouter>{children}</BrowserRouter>
    );
    return render(ui, { wrapper: Wrapper, ...options });
};
