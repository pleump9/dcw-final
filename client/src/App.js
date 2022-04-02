import axios from 'axios'
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import React, { useState } from 'react';
// P9's facebook app id 979747605978163
// Uekiz's facebook app id 492042448972691

function App() {

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
      console.log(result.data);
      setEmail(result.data.username);
      sessionStorage.setItem('access_token', result.data.access_token);
    }
  }

  const submitForm = async values => {
    console.log('waiting... ');
    const formData = new FormData();
    formData.append('text', values.text);
    formData.append('email', values.email)
    formData.append('file', values.file);
    // console.log(values.text);
    // console.log(values.file);
    // console.log(formData);
    let result = await axios({
      method: 'post',
      url: 'http://localhost:8080/form/submit',
      data: formData
    })
    console.log(result.data);
  }

  const getHistory = async values => {
    console.log('waiting... ');
    console.log(values.email);
    let result = await axios.get('http://localhost:8080/form/history', {
      params:
      {
        email: values.email
      }
    });
    console.log(result.data);
  }

  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [history, setHistory] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  return (
    <div className="App">

      <br />
      <div>
        <GoogleLogin
          clientId={'967709052865-n4vi83vdl1sdf79gh9coickriebopfmp.apps.googleusercontent.com'}
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
        >
          <span> Login with Google</span>
          {/* error.txt */}
        </GoogleLogin>
        <span style={{ marginLeft: '.5rem' }}></span>
        <div>
          {
            email === "" ?
              <FacebookLogin
                appId="492042448972691"
                autoLoad={true}
                fields="name,email,picture"
                callback={responseFacebook}
              />
              : <p> logged in as {email}</p>
          }
        </div>

      </div>

      <br />

      <div>

      </div>

      <form>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span style={{ marginLeft: '.5rem' }}></span>
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
        <button type='button' onClick={() => {
          if (email !== "") {
            var values = {
              text: text,
              email: email,
              file: selectedFile
            };
            // console.log(formData);
            submitForm(values);
          }
        }
        }>Submit</button>
      </form>

      <br />

      <div>
        <React.Fragment>
          <img
            src={imagePreviewUrl ? imagePreviewUrl : "https://media.discordapp.net/attachments/754687185235607587/954365809793314826/no-thumbnail-image-placeholder-forums-blogs-websites-148010362.png"
            }
            alt="mock img"
            style={{ width: "150px", height: "150px" }}
          />
        </React.Fragment>
      </div>

      <br />

      <div>
        <button type='button' onClick={() => {
          if (email !== "") {
            var values = {
              email: email,
            };
            // console.log(formData);
            getHistory(values);
          }
        }
        }>History</button>
      </div>
    </div>
  );
}

export default App;
