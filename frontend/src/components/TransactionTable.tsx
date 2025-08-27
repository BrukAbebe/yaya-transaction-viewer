import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaArrowDown, FaArrowUp, FaSpinner, FaFilter, FaSearch } from 'react-icons/fa';
import useDebounce from '../hooks/useDebounce';
import { Transaction, TransactionResponse, SearchRequest } from '../types';
import { fetchTransactions, searchTransactions } from '../services/yayaService';

const CURRENT_USER = 'yayawalletpi';

const TransactionTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [search, setSearch] = useState<SearchRequest>({
    id: '',
    senderAccount: '',
    receiverAccount: '',
    cause: '',
  });
  const [filterType, setFilterType] = useState<keyof SearchRequest>('id');
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const { data, error, isLoading } = useQuery({
    queryKey: ['transactions', page, search],
    queryFn: () => {
      const hasSearch = Object.values(search).some((val) => val);
      return hasSearch ? searchTransactions(search) : fetchTransactions(page);
    },
    keepPreviousData: true,
  });

  const transactions = data?.data || [];
  const lastPage = data?.lastPage || 1;

  const isIncoming = (transaction: Transaction) =>
    transaction.receiver.account === CURRENT_USER || transaction.is_topup;

  const handleSearchSubmit = () => {
    const trimmedValue = searchValue.trim();
    if (trimmedValue) {
      setSearch({
        id: filterType === 'id' ? trimmedValue : '',
        senderAccount: filterType === 'senderAccount' ? trimmedValue : '',
        receiverAccount: filterType === 'receiverAccount' ? trimmedValue : '',
        cause: filterType === 'cause' ? trimmedValue : '',
      });
      setTriggerSearch(true);
    } else {
      setSearch({ id: '', senderAccount: '', receiverAccount: '', cause: '' });
      setTriggerSearch(false);
    }
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleFilterTypeChange = (type: keyof SearchRequest) => {
    setFilterType(type);
    setSearchValue('');
    setSearch({ id: '', senderAccount: '', receiverAccount: '', cause: '' });
    setIsFilterOpen(false);
    setTriggerSearch(false);
    setPage(1);
  };

  const handlePageChange = async (direction: 'next' | 'prev') => {
    if (direction === 'next' && page < lastPage) {
      setIsNextLoading(true);
      setPage((prev) => prev + 1);
    } else if (direction === 'prev' && page > 1) {
      setIsPrevLoading(true);
      setPage((prev) => prev - 1);
    }
    setTimeout(() => {
      setIsNextLoading(false);
      setIsPrevLoading(false);
    }, 500);
  };

  // Trigger search on debounced input
  useEffect(() => {
    if (debouncedSearchValue.trim()) {
      handleSearchSubmit();
    } else if (!searchValue) {
      setSearch({ id: '', senderAccount: '', receiverAccount: '', cause: '' });
      setTriggerSearch(false);
    }
  }, [debouncedSearchValue]);

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search by ${filterType === 'id' ? 'Transaction ID' : filterType === 'senderAccount' ? 'Sender' : filterType === 'receiverAccount' ? 'Receiver' : 'Cause'}`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 sm:p-3 pl-8 sm:pl-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-xs sm:text-sm font-sans placeholder-gray-400"
              aria-label={`Search by ${filterType}`}
            />
            <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm" aria-hidden="true" />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 sm:p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-sans text-xs sm:text-sm"
            aria-label="Toggle filter options"
          >
            <FaFilter />
          </button>
          <button
            onClick={handleSearchSubmit}
            disabled={isLoading || !searchValue.trim()}
            className="p-2 sm:p-3 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-all duration-200 font-sans text-xs sm:text-sm"
            aria-label="Submit search"
          >
            <FaSearch />
          </button>
        </div>
        {isFilterOpen && (
          <div className="absolute z-10 mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-md shadow-md animate-slide-down sm:animate-slide-down max-h-[50vh] overflow-y-auto">
            <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
              <button
                onClick={() => handleFilterTypeChange('id')}
                className={`w-full text-left px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-sans ${filterType === 'id' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Transaction ID
              </button>
              <button
                onClick={() => handleFilterTypeChange('senderAccount')}
                className={`w-full text-left px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-sans ${filterType === 'senderAccount' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Sender Account
              </button>
              <button
                onClick={() => handleFilterTypeChange('receiverAccount')}
                className={`w-full text-left px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-sans ${filterType === 'receiverAccount' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Receiver Account
              </button>
              <button
                onClick={() => handleFilterTypeChange('cause')}
                className={`w-full text-left px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-sans ${filterType === 'cause' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Cause
              </button>
            </div>
          </div>
        )}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center py-6">
          <FaSpinner className="animate-spin text-blue-600 text-xl sm:text-2xl" aria-label="Loading transactions" />
        </div>
      )}
      {error && <div className="text-center text-red-600 font-sans text-xs sm:text-sm">Error: {error.message}</div>}
      {!isLoading && !error && transactions.length === 0 && (
        <div className="text-center text-gray-600 font-sans text-xs sm:text-sm">No transactions found</div>
      )}
      {transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[140px] sm:min-w-[160px]">
                  ID
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[110px] sm:min-w-[130px]">
                  Sender
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[110px] sm:min-w-[130px]">
                  Receiver
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[100px] sm:min-w-[110px]">
                  Amount
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[80px] sm:min-w-[90px]">
                  Currency
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[100px] sm:min-w-[110px]">
                  Cause
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[110px] sm:min-w-[130px]">
                  Created At
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-800 min-w-[100px] sm:min-w-[110px]">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-200 ${
                    isIncoming(transaction) ? 'bg-green-50/50' : 'bg-red-50/50'
                  } hover:bg-gray-50/50 transition-opacity duration-200 animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-700 font-sans">
                    {transaction.id}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-700 font-sans">
                    {transaction.sender.account}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-700 font-sans">
                    {transaction.receiver.account}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-700 font-sans">
                    {transaction.amount_with_currency}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-700 font-sans">
                    {transaction.currency}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-700 font-sans">
                    {transaction.cause}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-700 font-sans">
                    {new Date(transaction.created_at_time * 1000).toLocaleString()}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm">
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${
                        isIncoming(transaction)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isIncoming(transaction) ? (
                        <FaArrowDown className="mr-1 text-xs" aria-hidden="true" />
                      ) : (
                        <FaArrowUp className="mr-1 text-xs" aria-hidden="true" />
                      )}
                      {isIncoming(transaction) ? 'Incoming' : 'Outgoing'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!Object.values(search).some((val) => val) && transactions.length > 0 && (
        <div className="mt-4 sm:mt-6 flex justify-between items-center">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={page === 1 || isPrevLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-all duration-200 font-sans text-xs sm:text-sm"
            aria-label="Previous page"
          >
            {isPrevLoading ? (
              <FaSpinner className="animate-spin mr-1 sm:mr-2 text-xs sm:text-sm" aria-hidden="true" />
            ) : (
              'Previous'
            )}
          </button>
          <span className="text-gray-600 font-sans text-xs sm:text-sm">
            Page {page} of {lastPage}
          </span>
          <button
            onClick={() => handlePageChange('next')}
            disabled={page >= lastPage || isNextLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-all duration-200 font-sans text-xs sm:text-sm"
            aria-label="Next page"
          >
            {isNextLoading ? (
              <FaSpinner className="animate-spin mr-1 sm:mr-2 text-xs sm:text-sm" aria-hidden="true" />
            ) : (
              'Next'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
