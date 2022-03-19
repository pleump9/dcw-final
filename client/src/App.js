import axios from 'axios'
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import React from 'react';
// P9's app id 979747605978163

axios.interceptors.request.use(function (config) {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, function (err) {
  return Promise.reject(err)
})

const responseGoogle = (response) => {
  console.log(response);
}

const responseFacebook = async (response) => {
  console.log(response);
  if (response.accessToken) {
    console.log('log in with accessToken=' + response.accessToken);
    let result = await axios.post('http://localhost:8080/api/login', {
      token: response.accessToken
    })
    console.log(result.data)
    sessionStorage.setItem('access_token', result.data.access_token)
  }
}

const callInfoAPI = async () => {
  let result = await axios.get('http://localhost:8080/api/info')
  console.log(result.data)
}

function App() {
  return (
    <div className="App">
      <GoogleLogin
        clientId={'967709052865-n4vi83vdl1sdf79gh9coickriebopfmp.apps.googleusercontent.com'}
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
      >
        <span> Login with Google</span>
        {/* error.txt */}
      </GoogleLogin>
      <br/>
      <FacebookLogin
        appId="492042448972691"
        autoLoad={true}
        fields="name,email,picture"
        callback={responseFacebook} />,
      <button onClick={callInfoAPI}>Click me</button>
    </div>
  );
}

export default App;
