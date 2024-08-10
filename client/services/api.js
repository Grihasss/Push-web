import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8081',
})

export const subscribe = (subscription) => api.post('/add-subscription', 
    JSON.stringify(subscription)
  , {
    headers: {
      'Content-Type': 'application/json'
    },
  })

export const unsubscribe = (subscription) => api.post('/remove-subscription', 
    JSON.stringify({endpoint: subscription.endpoint}) , {
    headers: {
      'Content-Type': 'application/json'
    },
  })

export const notify = (subscription) => api.post('/notify-me', 
  JSON.stringify({endpoint: subscription.endpoint})
,{
  headers: {
    'Content-Type': 'application/json'
  },
});
const response = await fetch('/notify-all', {
  method: 'POST'
});

export const notifyAll = () => api.post('/notify-all');