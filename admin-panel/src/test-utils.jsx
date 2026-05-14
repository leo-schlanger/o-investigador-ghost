import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { NotificationProvider } from './context/NotificationContext';

export const renderWithRouter = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <NotificationProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </NotificationProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};
