import { TransactionResponse, SearchRequest } from '../types';

export const fetchTransactions = async (page: number): Promise<TransactionResponse> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('API URL not configured');
  }
  const response = await fetch(`${apiUrl}/transactions?p=${page}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  const data = await response.json();
  if (!Array.isArray(data.data)) {
    throw new Error('Expected an array of transactions in response.data');
  }
  return data;
};

export const searchTransactions = async (query: SearchRequest): Promise<TransactionResponse> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('API URL not configured');
  }
  console.log('Sending search query:', query);
  const response = await fetch(`${apiUrl}/transactions/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!response.ok) {
    throw new Error(`Failed to search transactions: ${response.statusText}`);
  }
  const data = await response.json();
  if (!Array.isArray(data.data)) {
    throw new Error('Expected an array of transactions in response.data');
  }
  return data;
};
