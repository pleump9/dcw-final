import axios from 'axios'
import FacebookLogin from 'react-facebook-login';
import React, { useState } from 'react';
import config from './config';
// P9's facebook app id 979747605978163
// Uekiz's facebook app id 492042448972691

function App() {

  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  axios.interceptors.request.use(function (config) {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  }, function (err) {
    return Promise.reject(err)
  })

  const responseFacebook = async (response) => {
    console.log(response);
    if (response.accessToken) {
      console.log('log in with accessToken=' + response.accessToken);
      let result = await axios.post(`${config.apiUrlPrefix}/login`, {
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
    let result = await axios({
      method: 'post',
      url: `${config.apiUrlPrefix}/form/submit`,
      data: formData
    })
    console.log(result.data);
    setText('');
    setSelectedFile(null);
    document.getElementById("input-file").value = null;
    setImagePreviewUrl(null)
  }

  const getHistory = async values => {
    console.log('waiting... ');
    console.log(values.email);
    let result = await axios.get(`${config.apiUrlPrefix}/form/history`, {
      params:
      {
        email: values.email
      }
    });
    console.log(result.data);
    setHistory(result.data);
  }

  const deleteHistory = async values => {
    console.log('waiting... ');
    console.log(values.item._id);
    let result = await axios.delete(`${config.apiUrlPrefix}/file/${values.item._id}`);
    console.log(result.data);
  }

  return (
    <div className="App" style={{ marginLeft: '50px' }}>
      <div>
        {
          email === "" ? <p></p> :
            <p> logged in as {email}</p>
        }
      </div>
      <div>
        {
          email === "" ?
            <FacebookLogin
              appId="492042448972691"
              autoLoad={true}
              fields="name,email,picture"
              callback={responseFacebook}
            />
            : <p></p>
        }
      </div>
      <br />
      <div>
      </div>

      <form>
        <label>
          Enter the text:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ marginLeft: '1em' }}
          />
        </label>
        <br />
        <br />
        <input
          type="file"
          id="input-file"
          onChange={(e) => {
            console.log(e.target.files[0]);
            setSelectedFile(e.target.files[0]);
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreviewUrl(reader.result)
            }
            reader.readAsDataURL(e.target.files[0])
          }}
        />
        <br />
        <div>
          <p>selected file preview : </p>
          <React.Fragment>
            <img
              src={imagePreviewUrl ? imagePreviewUrl : "https://media.discordapp.net/attachments/754687185235607587/954365809793314826/no-thumbnail-image-placeholder-forums-blogs-websites-148010362.png"
              }
              alt="mock img"
              style={{ width: "150px", height: "150px", marginLeft: "5em" }}
            />
          </React.Fragment>
        </div>
        <br />
        <button type='button' style={{ marginLeft: "20em" }}
          onClick={() => {
            if (email !== "") {
              var values = {
                text: text,
                email: email,
                file: selectedFile
              };
              submitForm(values);
            }
          }
          }>Submit</button>
      </form>
      <br />
      <div>
        <button type='button' style={{ marginTop: "5em" }}
          onClick={() => {
            if (email !== "") {
              var values = {
                email: email,
              };
              getHistory(values);
              setShowHistory(!showHistory);
            }
          }
          }>History</button>
      </div>
      <div>
        {
          showHistory ?
            <ul>
              {history.map((item, index) => {
                return (
                  <div key={index} style={{ marginBottom: "3em" }}>
                    createDate: {item.uploadDate}
                    <br />
                    Text: {item.metadata.text}
                    <span><button type='button' style={{ marginLeft: "20em" }}
                      onClick={() => {
                        var values = {
                          item: item,
                        };
                        deleteHistory(values);
                      }}>delete</button></span>
                    <br />
                    <img
                      src={`${config.apiUrlPrefix}/file/${item.filename}`}
                      alt="db img"
                      style={{ width: "150px", height: "150px", marginTop: "1em" }}
                    />
                    <span style={{ marginLeft: '50px' }}></span>
                  </div>)
              })}
            </ul>
            : <p></p>
        }
      </div>
    </div>
  );
}

export default App;
