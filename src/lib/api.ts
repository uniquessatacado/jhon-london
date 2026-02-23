import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://206.183.128.27:3003/api',
});

// Test connection on startup
api.get('/teste').then(response => {
  console.log('API Connection Test:', response.data);
}).catch(error => {
  console.error('API Connection Test Failed:', error.message);
});
