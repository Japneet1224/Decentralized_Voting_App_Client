// This checks if you are on Vite (import.meta.env) or Create React App (process.env)
const API_URL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL || 'http://localhost:5000';

export default API_URL;
