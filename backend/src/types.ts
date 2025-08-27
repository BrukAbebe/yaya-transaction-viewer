
   export interface Transaction {
     id: string;
     sender: {
       name: string;
       account: string;
     };
     receiver: {
       name: string;
       account: string;
     };
     amount_with_currency: string;
     amount: number;
     amount_in_base_currency: number;
     fee: number;
     currency: string;
     cause: string;
     sender_caption: string;
     receiver_caption: string;
     created_at_time: number;
     is_topup: boolean;
     is_outgoing_transfer: boolean;
     fee_vat: number;
     fee_before_vat: number;
   }

   export interface TransactionResponse {
     data: Transaction[];
     lastPage: number;
     total: number;
     perPage: number;
     incomingSum: number;
     outgoingSum: number;
   }

   export interface SearchRequest {
     id?: string;
     senderAccount?: string;
     receiverAccount?: string;
     cause?: string;
   }
