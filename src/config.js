const config = {
  apiUrl: `${process.env.REACT_APP_API_HOST}/splitwise/auth/`,
  userApiUrl: `${process.env.REACT_APP_API_HOST}/splitwise/user_info/`,
  logoutUrl: `${process.env.REACT_APP_API_HOST}/splitwise/logout/`,
  groupApiUrl: `${process.env.REACT_APP_API_HOST}/splitwise/groups_info/`,
  friendsApiUrl: `${process.env.REACT_APP_API_HOST}/splitwise/friends_info/`,
  uploadApiUrl: `${process.env.REACT_APP_API_HOST}/splitwise/upload_csv/`,
  createBulkTransactions: `${process.env.REACT_APP_API_HOST}/splitwise/create_bulk_transactions/`
};

export default config;
