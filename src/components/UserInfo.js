import React, { useState, useEffect } from "react";
import api from '../api';
import { useLocation } from "react-router-dom";
import "./UserInfo.css";
import config from "../config";
import { useNavigate } from 'react-router-dom';

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("userinfo");
        const response = await api.get(config.userApiUrl);
        setUser(response.data.result);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [location.search]);


  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="UserInfo">
      <h1>User Information</h1>
      <img
        src={user.picture.large}
        alt={`${user.first_name} ${user.last_name}`}
      />
      <h2>{`${user.first_name} ${user.last_name}`}</h2>
      <p>Email: {user.email}</p>
      <p>Registration Status: {user.registration_status}</p>
      <p>Default Currency: {user.default_currency}</p>
      <p>Locale: {user.locale}</p>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserInfo;