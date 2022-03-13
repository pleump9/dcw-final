import axios from 'axios'
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import React from 'react';

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
    <><div>
      <GoogleLogin
        clientId={'967709052865-n4vi83vdl1sdf79gh9coickriebopfmp.apps.googleusercontent.com'}
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
      >
        <span> Login with Google</span>
      </GoogleLogin>
      {/* ลองใช้ api แต่ invalid_request เกี่ยวกับ redirect_uri
      https://accounts.google.com/signin/oauth/error?authError=Cg9pbnZhbGlkX3JlcXVlc3QS3gEKWW91IGNhbid0IHNpZ24gaW4gdG8gdGhpcyBhcHAgYmVjYXVzZSBpdCBkb2Vzbid0IGNvbXBseSB3aXRoIEdvb2dsZSdzIE9BdXRoIDIuMCBwb2xpY3kgZm9yIGtlZXBpbmcgYXBwcyBzZWN1cmUuCgpZb3UgY2FuIGxldCB0aGUgYXBwIGRldmVsb3BlciBrbm93IHRoYXQgdGhpcyBhcHAgZG9lc24ndCBjb21wbHkgd2l0aCBvbmUgb3IgbW9yZSBHb29nbGUgdmFsaWRhdGlvbiBydWxlcy4KICAaWWh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2lkZW50aXR5L3Byb3RvY29scy9vYXV0aDIvcG9saWNpZXMjc2VjdXJlLXJlc3BvbnNlLWhhbmRsaW5nIJADKh4KDHJlZGlyZWN0X3VyaRIObG9jYWxob3N0OjMwMDA%3D&client_id=967709052865-n4vi83vdl1sdf79gh9coickriebopfmp.apps.googleusercontent.com */}
    </div><div className="App">
        <FacebookLogin
          appId="492042448972691"
          autoLoad={true}
          fields="name,email,picture"
          callback={responseFacebook} />,
        <button onClick={callInfoAPI}>Click me</button>
      </div></>
  );
}

export default App;
