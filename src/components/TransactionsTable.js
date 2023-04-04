import React, { useState, useEffect } from "react";
import axios from "axios";
import Select, { components } from "react-select";
import "./TransactionsTable.css";
import api from "../api";
import config from "../config";
import Checkbox from "@mui/material/Checkbox";
import { useNavigate } from "react-router-dom";
import BulkExpenseResultTable from "./BulkExpenseResultTable";

const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <Checkbox
        checked={props.isSelected}
        color="primary"
        style={{ marginRight: "8px" }}
      />
      {props.label}
    </components.Option>
  );
};

function TransactionsTable({
  transactions,
  setTransactions,
  groups,
  users,
  apiResponse,
  setApiResponse,
  selectedTransactions,
  setSelectedTransactions,
}) {
  const [isLoading, setIsLoading] = useState(false);

  function handleRowClick(id) {
    // Do nothing when clicking on an existing transaction
    if (
      transactions.find((transaction) => transaction.id === id)
        ?.existing_transaction
    ) {
      return;
    }

    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(
        selectedTransactions.filter((transactionId) => transactionId !== id)
      );
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  }

  function handleDescriptionChange(transactionId, newDescription) {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, bank_transaction_desc: newDescription }
          : transaction
      )
    );
  }

  async function handleTransactionSubmit() {
    setIsLoading(true);

    try {
      const selected = transactions.filter((transaction) =>
        selectedTransactions.includes(transaction.id)
      );

      const transactionsToSubmit = selected.map((transaction) => ({
        transactionDetails: transaction,
        group: transaction.group,
        users: transaction.users.map((user) => user.value),
      }));

      const response = await api.post(config.createBulkTransactions, {
        transactions: transactionsToSubmit,
      });

      if (response.status === 200) {
        console.log("Transactions submitted successfully");
        setApiResponse(response.data.result);
      } else {
        console.error("Error submitting transactions");
      }
    } catch (error) {
      console.error("Error submitting transactions:", error);
    }
    setIsLoading(false);
  }

  async function handleSubmit() {
    setIsLoading(true);
    const transactionsToSubmit = transactions.filter((transaction) =>
      selectedTransactions.includes(transaction.id)
    );
    await handleTransactionSubmit(transactionsToSubmit);
    setIsLoading(false);
  }

  function handleGroupChange(transactionId, newGroup) {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, group: newGroup }
          : transaction
      )
    );
  }

  function handleUsersChange(transactionId, newUsers) {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, users: newUsers }
          : transaction
      )
    );
  }

  return (
    <>
      {!apiResponse && (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Description</th>
                <th>Group</th>
                <th>Users</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isExistingTransaction = transaction.existing_transaction;
                return (
                  <tr
                    key={transaction.id}
                    className={isExistingTransaction ? "blocked-row" : ""}
                  >
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        !isExistingTransaction &&
                          handleRowClick(transaction.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        readOnly
                        disabled={isExistingTransaction}
                      />
                    </td>
                    <td>{transaction.transaction_amount}</td>
                    <td>{transaction.bank_transaction_time}</td>
                    <td>
                      <input
                        type="text"
                        value={transaction.bank_transaction_desc}
                        onChange={(event) =>
                          !isExistingTransaction &&
                          handleDescriptionChange(
                            transaction.id,
                            event.target.value
                          )
                        }
                        disabled={isExistingTransaction}
                      />
                    </td>
                    <td>
                      <select
                        value={transaction.group}
                        onChange={(event) =>
                          !isExistingTransaction &&
                          handleGroupChange(transaction.id, event.target.value)
                        }
                        disabled={isExistingTransaction}
                      >
                        <option value="">Select an option</option>
                        {groups.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Select
                        options={users}
                        value={transaction.users}
                        onChange={(selectedOptions) =>
                          !isExistingTransaction &&
                          handleUsersChange(transaction.id, selectedOptions)
                        }
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        components={{
                          Option: CheckboxOption,
                        }}
                        isDisabled={isExistingTransaction}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Selected Transactions"}
          </button>{" "}
        </div>
      )}
      {apiResponse && (
        <BulkExpenseResultTable
          transactions={transactions}
          apiResponse={apiResponse}
        />
      )}
    </>
  );
}

export default TransactionsTable;
