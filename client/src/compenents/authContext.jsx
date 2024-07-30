import React, { createContext, useState ,useEffect} from 'react';
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken')||null);
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);
  return (
    <AuthContext.Provider value={ {token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext, AuthProvider };