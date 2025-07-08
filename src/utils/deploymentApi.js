// Deployment API utility functions
import AuthUtils from './authUtils';

export async function scheduleDeployment({ campaignIds, platforms }) {
  const response = await AuthUtils.authenticatedFetch('/api/deployments/schedule', {
    method: 'POST',
    body: JSON.stringify({ campaignIds, platforms })
  });
  if (!response.ok) throw new Error('Failed to schedule deployment');
  return response.json();
}

export async function getDeploymentStatus() {
  const response = await AuthUtils.authenticatedFetch('/api/deployments/status');
  if (!response.ok) throw new Error('Failed to fetch deployment status');
  return response.json();
}

export async function getDeploymentHistory() {
  const response = await AuthUtils.authenticatedFetch('/api/deployments/history');
  if (!response.ok) throw new Error('Failed to fetch deployment history');
  return response.json();
} 