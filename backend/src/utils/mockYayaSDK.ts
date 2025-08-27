
import { Transaction, SearchRequest } from '../types';

const mockTransactions: Transaction[] = [
  {
    id: '7446ee50-418f-9c8f-03f2466f514f',
    sender: { name: 'Yaya Wallet Pii', account: 'yayawalletpi' },
    receiver: { name: 'YaYa PII SC', account: 'antenehgebey' },
    amount_with_currency: '2,500.00 ETB',
    amount: 2500,
    amount_in_base_currency: 2500,
    fee: 5.75,
    currency: 'ETB',
    cause: 'Pay',
    sender_caption: '',
    receiver_caption: '',
    created_at_time: 1756101350,
    is_topup: false,
    is_outgoing_transfer: false,
    fee_vat: 0.75,
    fee_before_vat: 5,
  },
  {
    id: 'f30a36f1-413b-b9c4-a63d1549aa03',
    sender: { name: 'Yaya Wallet Pii', account: 'yayawalletpi' },
    receiver: { name: 'Habetamu Worku Feleke', account: 'tewobstatewo' },
    amount_with_currency: '2,500.00 ETB',
    amount: 2500,
    amount_in_base_currency: 2500,
    fee: 5.75,
    currency: 'ETB',
    cause: 'Pay',
    sender_caption: '',
    receiver_caption: '',
    created_at_time: 1756101331,
    is_topup: false,
    is_outgoing_transfer: false,
    fee_vat: 0.75,
    fee_before_vat: 5,
  },
  {
    id: 'b7a2ed8407-cba5e9575d59',
    sender: { name: 'Surafel Araya', account: 'surafelaraya' },
    receiver: { name: 'Yaya Wallet Pii', account: 'yayawalletpi' },
    amount_with_currency: '300.00 ETB',
    amount: 300,
    amount_in_base_currency: 300,
    fee: 1.15,
    currency: 'ETB',
    cause: 'Pay',
    sender_caption: '',
    receiver_caption: '',
    created_at_time: 1756033429,
    is_topup: false,
    is_outgoing_transfer: false,
    fee_vat: 0.15,
    fee_before_vat: 1,
  },
  {
    id: '9e889994-657-c88b9bcd2fb6',
    sender: { name: 'Yaya Wallet Pii', account: 'yayawalletpi' },
    receiver: { name: 'Yaya Wallet Pii', account: 'yayawalletpi' },
    amount_with_currency: '500.00 ETB',
    amount: 500,
    amount_in_base_currency: 500,
    fee: 1.15,
    currency: 'ETB',
    cause: 'Top-up',
    sender_caption: '',
    receiver_caption: '',
    created_at_time: 1756033389,
    is_topup: true,
    is_outgoing_transfer: false,
    fee_vat: 0.15,
    fee_before_vat: 1,
  },
  {
    id: 'a2bbd8-47a6-a306-274c6f784c74',
    sender: { name: 'YaYa PII SC', account: 'antenehgebey' },
    receiver: { name: 'Yaya Wallet Pii', account: 'yayawalletpi' },
    amount_with_currency: '1,000.00 ETB',
    amount: 1000,
    amount_in_base_currency: 1000,
    fee: 2.3,
    currency: 'ETB',
    cause: 'Allowance',
    sender_caption: '',
    receiver_caption: '',
    created_at_time: 1756033360,
    is_topup: false,
    is_outgoing_transfer: false,
    fee_vat: 0.3,
    fee_before_vat: 2,
  },
];

export async function getTransactionListByUser(page: number): Promise<{
  data: Transaction[];
  lastPage: number;
  total: number;
  perPage: number;
  incomingSum: number;
  outgoingSum: number;
}> {
  console.log(`[MOCK] Fetching transactions for page ${page}`);
  const perPage = 3;
  const total = mockTransactions.length;
  const lastPage = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    data: mockTransactions.slice(start, end),
    lastPage,
    total,
    perPage,
    incomingSum: mockTransactions.reduce(
      (sum, txn) =>
        sum + (txn.receiver.account === 'yayawalletpi' || txn.is_topup ? txn.amount : 0),
      0
    ),
    outgoingSum: mockTransactions.reduce(
      (sum, txn) => sum + (txn.sender.account === 'yayawalletpi' && !txn.is_topup ? txn.amount : 0),
      0
    ),
  };
}

export async function searchTransaction(query: SearchRequest): Promise<{
  data: Transaction[];
  lastPage: number;
  total: number;
  perPage: number;
  incomingSum: number;
  outgoingSum: number;
}> {
  console.log(`[MOCK] Searching transactions with query:`, query);
  const filtered = mockTransactions.filter((txn) => {
    const matchesId = query.id
      ? txn.id.toLowerCase().includes(query.id.toLowerCase())
      : true;
    const matchesSender = query.senderAccount
      ? txn.sender.account.toLowerCase().includes(query.senderAccount.toLowerCase())
      : true;
    const matchesReceiver = query.receiverAccount
      ? txn.receiver.account.toLowerCase().includes(query.receiverAccount.toLowerCase())
      : true;
    const matchesCause = query.cause
      ? txn.cause.toLowerCase().includes(query.cause.toLowerCase())
      : true;
    return matchesId && matchesSender && matchesReceiver && matchesCause;
  });
  return {
    data: filtered,
    lastPage: 1,
    total: filtered.length,
    perPage: filtered.length,
    incomingSum: filtered.reduce(
      (sum, txn) =>
        sum + (txn.receiver.account === 'yayawalletpi' || txn.is_topup ? txn.amount : 0),
      0
    ),
    outgoingSum: filtered.reduce(
      (sum, txn) => sum + (txn.sender.account === 'yayawalletpi' && !txn.is_topup ? txn.amount : 0),
      0
    ),
  };
}
