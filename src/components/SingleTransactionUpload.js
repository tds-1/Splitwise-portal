import React, { useState, useEffect } from "react";
import "./SingleTransactionUpload.css";
import api from "../api";
import config from "../config";
import Select, { components } from "react-select";
import Header from './Header'; // Adjust the path based on your project structure


const SingleTransactionUpload = () => {
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [groupId, setGroupId] = useState("");
  const [users, setUsers] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupResponse = await api.get(config.groupApiUrl);
        setGroupData(groupResponse.data.result);

        const userResponse = await api.get(config.friendsApiUrl);
        setUserData(userResponse.data.result.map(user => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name || ""}`
        })));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getGroupName = (groupId) => {
    console.log(groupData);
    const groupIdInt = parseInt(groupId, 10);
    const group = groupData.find(g => g.id === groupIdInt);
    return group ? group.name : 'Unknown Group';
  };

  const getUserNames = (userIds) => {
    return userIds.map(userId => {
      const user = userData.find(u => u.value === userId);
      return user ? user.label : 'You';
    }).join(", ");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsError(false); // Reset error state on new submission
    setResponseMessage(''); // Reset response message
    setTransactionDetails(null); // Reset transaction details

    const payload = {
      title,
      cost,
      groupId,
      users: users.map(u => u.value)
    };

    try {
      const response = await api.post(config.transactionUploadApiUrl, payload);
      if (response.data.result.success) {
        const detailedTransaction = {
            ...response.data.result.transaction,
            groupName: getGroupName(response.data.result.transaction.groupId),
            userNames: getUserNames(response.data.result.transaction.users)
        };
        setTransactionDetails(detailedTransaction);
        setResponseMessage("Transaction uploaded successfully!");
        setTitle(''); // Reset title
        setCost(''); // Reset cost
    } else {
        setIsError(true);
        setResponseMessage("Error: " + response.data.result.description);
      }
    } catch (error) {
      setIsError(true);
      setResponseMessage("An error occurred while uploading the transaction.");
      console.error("Error uploading transaction:", error);
    }
  };

  return (
    <>
    <Header />
    <div className="single-transaction-upload-container">

      <h1 className="single-transaction-upload-heading">Single Transaction Upload</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cost">Cost:</label>
          <input
            type="number"
            id="cost"
            value={cost}
            onChange={e => setCost(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="group">Group:</label>
          <select
            id="group"
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
          >
            <option value="">Select a Group</option>
            {groupData.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="users">Users:</label>
          <Select
            id="users"
            options={userData}
            isMulti
            value={users}
            onChange={setUsers}
            components={{ DropdownIndicator: components.DropdownIndicator }}
          />
        </div>
        <div className="form-submit">
          <button type="submit">Upload Transaction</button>
        </div>
        {responseMessage && (
          <div className={`response-message ${isError ? 'error' : 'success'}`}>
            {responseMessage}
          </div>
        )}
        {transactionDetails && !isError && (
          <div className="transaction-details">
            <h2>Transaction Details</h2>
            <p>Title: {transactionDetails.title}</p>
            <p>Cost: {transactionDetails.cost}</p>
            <p>Group ID: {transactionDetails.groupName}</p>
            <p>Users: {transactionDetails.userNames}</p>
          </div>
        )}
      </form>
    </div>
    </>
  );
};

export default SingleTransactionUpload;
