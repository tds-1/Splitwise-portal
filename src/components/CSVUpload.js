import React, { useState, useEffect } from "react";
import "./CSVUpload.css";
import api from "../api";
import config from "../config";
import Select, { components } from "react-select";
import Checkbox from "@mui/material/Checkbox";
import TransactionsTable from "./TransactionsTable"

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
const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [dropdown1, setDropdown1] = useState("");
  const [dropdown2, setDropdown2] = useState(() => {
    const storedOptions = localStorage.getItem("friends_data");
    return storedOptions ? JSON.parse(storedOptions) : [];
  });
  const [data, setData] = useState([]);
  const [userdata, setUserdata] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("here");
      try {
        const response = await api.get(config.groupApiUrl);
        setData(response.data.result);
        try {
          const friendsResponse = await api.get(config.friendsApiUrl);
          setUserdata(friendsResponse.data.result);
        } catch (err) {
          console.err("Error fetching group data:", err);
        }
        if (localStorage.getItem("groups_data")) {
          setDropdown1(localStorage.getItem("groups_data"));
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    localStorage.setItem("groups_data", dropdown1);
    localStorage.setItem("friends_data", JSON.stringify(dropdown2));

    try {
      const response = await api.post(config.uploadApiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedTransactions = response.data.result.map((transaction) => ({
        ...transaction,
        group: dropdown1,
        users: dropdown2,
        id: transaction.id,
      }));
      console.log(updatedTransactions);
      setTransactions(updatedTransactions);
      setApiResponse(null);
      setSelectedTransactions([]);
      return response.data.result;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDropdown1Change = (event) => {
    setDropdown1(event.target.value);
  };

  const handleDropdown2Change = (selectedOptions) => {
    setDropdown2(selectedOptions);
  };

  const selectOptions = userdata.map((item) => ({
    value: item.id,
    label: `${item.first_name} ${item.last_name || ""}`,
  }));

  return (
    <div>
    <form className="csv-upload-container" onSubmit={handleSubmit}>
      <h1 className="csv-upload-heading">CSV Upload</h1>
      <div className="csv-upload-input">
        <label htmlFor="csv-file-input">Choose a CSV file: </label>
        <input
          type="file"
          id="csv-file-input"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
        />
      </div>
      <div className="csv-upload-dropdown">
        <label htmlFor="dropdown1">Select Default Group: </label>
        <select
          id="dropdown1"
          value={dropdown1}
          onChange={handleDropdown1Change}
        >
          <option value="">Select an option</option>
          {data.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="csv-upload-dropdown">
        <label htmlFor="dropdown2">Select Default Users: </label>
        <Select
          id="dropdown2"
          options={selectOptions}
          value={dropdown2}
          onChange={handleDropdown2Change}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          components={{
            Option: CheckboxOption,
          }}
        />
      </div>
      <div className="csv-upload-submit">
        <button type="submit">Submit</button>
      </div>
    </form>
    <div  className="csv-upload-container" >
      <TransactionsTable
        transactions={transactions}
        setTransactions={setTransactions}
        groups={data}
        users={selectOptions}
        selectedUsers={dropdown2}
        apiResponse={apiResponse}
        setApiResponse={setApiResponse}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
      />
      </div>
    </div>
  );
};

export default CSVUpload;
