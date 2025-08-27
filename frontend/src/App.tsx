import TransactionTable from './components/TransactionTable';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <div className="w-full p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <h1
        className="text-xl sm:text-2xl lg:text-3xl font-bold font-sans text-gray-800 text-center animate-fade-in"
        aria-label="YaYa Wallet Transactions Dashboard"
      >
        YaYa Wallet Transactions
      </h1>
      <ErrorBoundary>
        <TransactionTable />
      </ErrorBoundary>
    </div>
  );
};

export default App;
