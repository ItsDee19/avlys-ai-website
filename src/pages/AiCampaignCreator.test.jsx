import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiCampaignCreator from './AiCampaignCreator';
import AuthUtils from '../utils/authUtils';
import { getUserProfile } from '../utils/firestoreUtils';

// Mock dependencies
jest.mock('../utils/authUtils', () => ({
  getUserFromToken: jest.fn(),
  getToken: jest.fn(),
}));
jest.mock('../utils/firestoreUtils');

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ url: 'https://stripe.com/checkout/test' }),
  })
);

describe('AiCampaignCreator', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
  });

  it('shows an error if the user is not logged in', async () => {
    AuthUtils.getUserFromToken.mockReturnValue(null);
    render(<MemoryRouter><AiCampaignCreator /></MemoryRouter>);
    expect(await screen.findByText('Error: You must be logged in to create a campaign.')).toBeInTheDocument();
  });

  it('fetches and displays user profile information', async () => {
    AuthUtils.getUserFromToken.mockReturnValue({ uid: 'test-user-id' });
    getUserProfile.mockResolvedValue({
      business: { name: 'Test Business', industry: 'Testing', description: 'A test business.' },
    });
    render(<MemoryRouter><AiCampaignCreator /></MemoryRouter>);
    expect(await screen.findByText('Test Business')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('A test business.')).toBeInTheDocument();
  });

  it('shows an error if the user profile fails to load', async () => {
    AuthUtils.getUserFromToken.mockReturnValue({ uid: 'test-user-id' });
    getUserProfile.mockRejectedValue(new Error('Firestore Error'));
    render(<MemoryRouter><AiCampaignCreator /></MemoryRouter>);
    expect(await screen.findByText('Error: Failed to fetch your profile. Please complete your profile first.')).toBeInTheDocument();
  });
}); 