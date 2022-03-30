import axios from 'axios'
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import React, { useState } from 'react';
// P9's facebook app id 979747605978163
// Uekiz's facebook app id 492042448972691

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
  console.log(result.data);
}

const submitForm = async values => {
  console.log('waiting... ');
  const formData = new FormData();
  formData.append('name', values.name);
  formData.append('email', 'p9@gmail.com')
  formData.append('file', values.file);
  // console.log(values.name);
  // console.log(values.file);
  // console.log(formData);
  let result = await axios({
    method: 'post',
    url: 'http://localhost:8080/form/submit',
    data: formData
    })
  console.log(result.data);
}

function App() {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
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
      <br />
      <FacebookLogin
        appId="492042448972691"
        autoLoad={true}
        fields="name,email,picture"
        callback={responseFacebook} />,
      <button onClick={callInfoAPI}>Click me</button>
      <form>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="file"
          // value={selectedFile}
          onChange={(e) => {
            console.log(e.target.files[0]);
            setSelectedFile(e.target.files[0]);
            // console.log(selectedFile);
            // console.log(imagePreviewUrl);
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreviewUrl(reader.result)
            }
            reader.readAsDataURL(e.target.files[0])
          }}
        />
        <button type='button' onClick={() => 
          {
            var values = {
              name: name,
              file: selectedFile
            };
            // console.log(formData);
            submitForm(values);
          }
        }>Submit</button>
      </form>
      <React.Fragment>
        <img
          src={imagePreviewUrl ? imagePreviewUrl : "https://www.gamudacove.com.my/media/img/default-img.jpg"
          }
          style={{ width: "150px", height: "150px" }}
        />
      </React.Fragment>
    </div>
  );
}

export default App;
