
# YaYa Wallet Transaction Viewer

This project provides a full-stack solution for viewing and searching YaYa Wallet transactions. It consists of a React.js frontend for displaying the transaction table and an Express.js backend that integrates with the `@yayawallet/node-sdk` to fetch and search transaction data.

## Table of Contents

*   [Features](#features)
*   [Technologies Used](#technologies-used)
*   [Setup and Installation](#setup-and-installation)
    *   [Prerequisites](#prerequisites)
    *   [Environment Variables](#environment-variables)
    *   [Frontend Setup](#frontend-setup)
    *   [Backend Setup](#backend-setup)
*   [Running the Application](#running-the-application)
    *   [Running Frontend](#running-frontend)
    *   [Running Backend](#running-backend)
*   [API Endpoints](#api-endpoints)
*   [Assumptions](#assumptions)
*   [Problem-Solving Approach](#problem-solving-approach)
*   [Testing](#testing)
    *   [Frontend Testing](#frontend-testing)
    *   [Backend Testing](#backend-testing)

---

## Features

*   **Transaction Display**: Shows a table of recent transactions for a predefined user (`yayawalletpi`).
*   **Pagination**: Allows navigating through pages of transactions.
*   **Search Functionality**: Users can search transactions by ID, Sender Account, Receiver Account, or Cause.
*   **Debounced Search**: Improves performance by delaying search queries until the user pauses typing.
*   **Transaction Type Indication**: Visually distinguishes between incoming (green) and outgoing (red) transactions.
*   **Responsive Design**: The table and search interface are designed to be viewable on different screen sizes (though specific styling for mobile might need further refinement).
*   **Robust Backend**:
    *   Integrates with `@yayawallet/node-sdk`.
    *   Includes retry mechanisms for API calls.
    *   Centralized error handling.
    *   Request validation using `zod`.
    *   Security middleware (Helmet, CORS, Rate Limiting).
    *   Structured logging.
*   **Error Boundary**: Catches and displays UI errors gracefully in the frontend.

## Technologies Used

### Frontend
*   **React.js**: JavaScript library for building user interfaces.
*   **TypeScript**: Statically typed superset of JavaScript.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **`@tanstack/react-query`**: For efficient data fetching, caching, and state management.
*   **`react-icons`**: For easily including popular icon libraries.

### Backend
*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **TypeScript**: Statically typed superset of JavaScript.
*   **`dotenv`**: For loading environment variables.
*   **`cors`**: Express middleware for enabling Cross-Origin Resource Sharing.
*   **`helmet`**: Express middleware for securing HTTP headers.
*   **`express-rate-limit`**: Basic rate-limiting middleware.
*   **`morgan`**: HTTP request logger middleware.
*   **`zod`**: TypeScript-first schema declaration and validation library.
*   **`@yayawallet/node-sdk`**: YaYa Wallet's official Node.js SDK for API interactions.


## Setup and Installation

### Prerequisites

*   Node.js (v14 or higher recommended)

### Environment Variables

Both the frontend and backend require environment variables.

#### Frontend (`Frontend/.env`)

```env
# URL for the backend API
VITE_API_BASE_URL=http://localhost:5001/api
```

#### Backend (`Backend/.env`)

```env
# --- YaYa Wallet API Configuration ---
YAYA_API_URL=YAYA_API_URL           # YaYa Wallet production API URL
YAYA_API_KEY=your_yaya_api_key_here                # Your YaYa API Key
YAYA_API_SECRET=your_yaya_api_secret_here          # Your YaYa API Secret
YAYA_API_PATH=/api/en                              # YaYa API Path (default /api/en)
YAYA_TEST_API_URL=YAYA_TEST_API_URL    # YaYa Wallet Test API URL

# --- Server Configuration ---
PORT=5001                                          # Port for the Express server
NODE_ENV=development                               # 'development' or 'production'
VITE_CLIENT_URL=http://localhost:5174              # URL of your frontend application
```

**Important:** Replace `your_yaya_api_key_here` and `your_yaya_api_secret_here` with your actual YaYa Wallet API credentials.

### Frontend Setup

1.  Navigate to the `Frontend` directory:
    ```bash
    cd Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
   
    ```
3.  Create a `.env` file in the `Frontend` directory and add the `VITE_API_BASE_URL` variable as shown above.

### Backend Setup

1.  Navigate to the `Backend` directory:
    ```bash
    cd Backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    
    ```
3.  Create a `.env` file in the `Backend` directory and add all the required environment variables as shown in the "Environment Variables" section.

## Running the Application

### Running Frontend

1.  From the `frontend` directory:
    ```bash
    npm run dev
   
    ```
    The frontend application will typically run on `http://localhost:5174` .

### Running Backend

1.  From the `backend` directory:
    ```bash
    npm run dev
    or
    npm run start:dev
    ```
    The backend API will typically run on `http://localhost:5001`.

## API Endpoints

The backend provides the following endpoints:

*   **`GET /api/transactions`**
    *   **Description**: Fetches a paginated list of transactions.
    *   **Query Parameters**:
        *   `p`: (Optional) The page number to retrieve. Defaults to 1.
    *   **Example Request**: `GET http://localhost:5000/api/transactions?p=2`
    *   **Example Response**:
        ```json
        {
          "data": [
            {
              "id": "trans_123...",
              "sender": { "account": "sender_acc", "name": "Sender Name" },
              "receiver": { "account": "receiver_acc", "name": "Receiver Name" },
              "amount": 100,
              "currency": "KES",
              "amount_with_currency": "100.00 KES",
              "cause": "Payment for service",
              "created_at_time": 1678886400,
              "is_topup": false
            }
          ],
          "lastPage": 5
        }
        ```

*   **`POST /api/transactions/search`**
    *   **Description**: Searches for transactions based on specified criteria.
    *   **Request Body (JSON)**:
        *   `id`: (Optional) Transaction ID to search for.
        *   `senderAccount`: (Optional) Sender's account to search for.
        *   `receiverAccount`: (Optional) Receiver's account to search for.
        *   `cause`: (Optional) Cause/description of the transaction to search for.
        *   **Note**: At least one search field must be provided.
    *   **Example Request**: `POST http://localhost:5000/api/transactions/search`
        ```json
        {
          "id": "njahbcbaubuwnfc76353"
        }
        ```
    *   **Example Response**: (Same as `GET /api/transactions`)

## Assumptions

1.  **YaYa SDK Integration**: It's assumed that the `@yayawallet/node-sdk` is correctly installed and configured to interact with the YaYa Wallet API. The `getTransactionListByUser`, `searchTransaction`, and `getTime` functions are expected to work as per the SDK's documentation.
2.  **Authentication**: The backend relies on environment variables (`YAYA_API_KEY`, `YAYA_API_SECRET`) for authenticating with the YaYa Wallet API.
3.  **Frontend API Service**: The frontend's `yayaService.ts` is assumed to correctly make `GET` requests to `/api/transactions` and `POST` requests to `/api/transactions/search` based on the `VITE_API_BASE_URL` environment variable.
4.  **`CURRENT_USER`**: The frontend component hardcodes `CURRENT_USER = 'yayawalletpi'`. This is used to determine if a transaction is "incoming" or "outgoing" relative to this specific user. In a real application, this would typically be dynamically fetched after user authentication.
5.  **SDK Response Format**: The `yayaService.ts` in the backend assumes that the `getTransactionListByUser` and `searchTransaction` methods from the SDK return an object with a `data` array and a `lastPage` number, matching the `TransactionResponse` interface. It also expects `getTime` to return an object with a `time` number.
6.  **Error Handling for SDK**: The backend's `yayaService.ts` includes retry logic and specific error logging for SDK calls. It attempts to gracefully handle network issues or invalid API responses, but ultimate success depends on the stability of the YaYa API and the SDK.
7.  **Pagination for Search**: The `searchTransactions` backend service, as implemented, does not include pagination. It returns all matching results. If the YaYa SDK's `searchTransaction` supports pagination, the `TransactionResponse` interface and `searchTransactions` service would need to be updated to pass and handle page numbers for search results. For the current frontend, if search returns many results, they will all be displayed, and the pagination controls will be hidden.


## Problem-Solving Approach

1.  **Decomposition**: The problem was naturally split into frontend and backend components. The frontend handles UI, user interaction, and data display, while the backend focuses on API integration, data retrieval, and serving the frontend.
2.  **Frontend First (given)**: The initial frontend code was provided, so the task was to ensure the backend could seamlessly support its requirements. This meant defining shared types (`types.ts`) that the backend would adhere to.
3.  **Backend Structure (Express.js)**:
    *   **Modularization**: Organized into `controllers`, `services`, `middleware`, and `utils` for maintainability and separation of concerns.
    *   **SDK Integration**: The `yayaService.ts` was the core integration point with the `@yayawallet/node-sdk`. This centralizes all external API calls.
    *   **Robustness**: Implemented retry logic for `getServerTime` and `searchTransactions` to handle transient network issues or API flakiness. Timeout was added for `searchTransaction` to prevent indefinite hanging.
    *   **Error Handling**: A custom `ApiError` class and a global `errorHandler` middleware were used to provide consistent and informative error responses to the client, while logging detailed errors on the server.
    *   **Validation**: `zod` was chosen for schema-based validation of incoming requests (`validatePagination`, `validateSearchQuery`) to ensure data integrity and provide clear feedback for invalid inputs.
    *   **Security**: Basic security measures like `helmet`, `cors`, and `express-rate-limit` were added.
    *   **Logging**: A simple logger was implemented to provide visibility into application flow and errors, crucial for debugging and monitoring.

5.  **Environment Variables**: All sensitive information and configuration parameters were externalized into `.env` files, promoting best practices for deployment and easy configuration changes.


## Testing

### Frontend Testing

*   **Manual Testing**:
    *   **Initial Load**: Verify that the transaction table loads correctly on initial page access.
    *   **Pagination**: Test "Previous" and "Next" buttons. Ensure they are disabled at the start/end of pages. Observe loading spinners.
    *   **Search**:
        *   Enter values in the search bar and press Enter or click the search button.
        *   Test searching by Transaction ID, Sender Account, Receiver Account, and Cause using the filter dropdown.
        

### Backend Testing

*   **API Client (Postman/Insomnia/curl)**:
    *   **`GET /api/transactions`**:
        *   `GET /api/transactions`: Test default page (page 1).
        *   `GET /api/transactions?p=2`: Test specific page.
        *   `GET /api/transactions?p=0` or `GET /api/transactions?p=-5`: Test invalid page numbers (expect 400 Bad Request).
        *   `GET /api/transactions?p=abc`: Test non-numeric page (expect 400 Bad Request).
        *   Observe the `data` and `lastPage` in the response.
    *   **`POST /api/transactions/search`**:
        *   `POST /api/transactions/search` with body `{ "id": "some_id" }`: Test search by ID.
        *   `POST /api/transactions/search` with body `{ "senderAccount": "johndoe" }`: Test search by sender.
        *   `POST /api/transactions/search` with body `{ "cause": "utility" }`: Test search by cause.
        *   `POST /api/transactions/search` with empty body `{}`: Expect 400 Bad Request ("At least one search field must be provided").
        *   `POST /api/transactions/search` with unknown fields or oversized strings (expect 400 Bad Request due to `zod` validation).
        *   Test with valid search queries that are expected to return no results.

---
