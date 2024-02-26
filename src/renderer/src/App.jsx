import './App.css';
import { useState } from 'react';
import Login from './components/Login';

const API_TOKEN = 'super_secret';
const API_BASE = 'https://craftstrom.azurewebsites.net/api/';

const devices = {
  1: 'new solar panel inverter',
  2: 'amp-meter',
  3: 'battery',
  0: 'old solar panel inverter',
};

function App() {
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));

  const pairDevice = (event) => {
    event.preventDefault();
    setConfirmed(true);
    setLoading(true);
    const formData = new FormData(event.target);
    let deviceData = {
      device_id: formData.get('device_id'),
      craftstrom_api_token: API_TOKEN,
      craftstrom_api_url:
        'https://craftstrom.azurewebsites.net/api/devices/meterings',
      craftstrom_api_update_interval: 30,
      ssid: formData.get('ssid'),
      password: formData.get('password'),
      selected_device_id: formData.get('selected_device_id'),
      selected_device_label: devices[formData.get('selected_device_id')],
    };

    fetch('https://192.168.4.1/rest', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
      timeout: 60000,
    })
      .then((response) => {
        setPairingSuccess(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        setError(true);
      });
  };

  const registerDevice = async () => {
    const formData = new FormData(document.querySelector('form'));
    const deviceId = formData.get('device_id');
    const selectedDeviceId = formData.get('selected_device_id');
    try {
      switch (selectedDeviceId) {
        case '0':
        case '1':
          await fetch(`${API_BASE}devices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              DeviceId: deviceId,
            }),
          });
          break;
        case '2':
          await fetch(`${API_BASE}ampmeters`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              DeviceId: deviceId,
              Name: 'New Power Meter',
            }),
          });
          break;
        case '3':
          await fetch(`${API_BASE}batteries`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              BatteryId: deviceId,
              BatterySerialNumber: deviceId,
              BatteryName: 'New Battery',
            }),
          });
          break;
        default:
          console.error('Unknown device type');
      }
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  };

  const confirmPairing = async (event) => {
    event.preventDefault();
    if (!registered) {
      if (await registerDevice()) {
        setRegistered(true);
      }
      return;
    } else {
      setSubmitted(true);
    }
  };

  if (!userToken) {
    return <Login setUserToken={setUserToken} />;
  }

  return (
    <>
      <h1>Pair your Craftstrom device</h1>
      <div className="card">
        <form onSubmit={submitted ? pairDevice : confirmPairing}>
          <fieldset>
            <legend>
              Please select the type of device you are trying to pair
            </legend>
            <select name="selected_device_id">
              <option value="1">Solar Panel (2nd Gen)</option>
              <option value="2">Power Meter</option>
              <option value="3">Battery</option>
              <option value="0">Solar Panel</option>
            </select>
          </fieldset>
          <fieldset>
            <legend>
              Please carefully enter your home WiFi network name and password,
              so that we can configure your CraftStrom device
            </legend>
            <input type="text" name="ssid" placeholder="SSID" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
          </fieldset>
          <fieldset>
            <legend>
              Your Craftstrom device has a barcode on it with a device ID.
              Please enter that device ID below
            </legend>
            <input
              type="text"
              name="device_id"
              placeholder="Device ID"
              required
            />
          </fieldset>
          {!registered && (
            <input type="submit" value="Register Craftstrom Device Online" />
          )}
          {!!registered && !!submitted && !confirmed && (
            <input
              className="warning"
              type="submit"
              value="Are you sure you're connected to CS-WIFI?"
            />
          )}
          {!!registered && !submitted && !confirmed && (
            <>
              <p>
                Connect your computer to the CS-WIFI network, enter the password{' '}
                <code>12345678</code> and press the button below
              </p>
              <input type="submit" value="Confirm and pair device" />
            </>
          )}
          {!!submitted && !!confirmed && (
            <>
              {loading && <p>Pairing in progress...</p>}
              {!!pairingSuccess && <p>Pairing successful!</p>}
              {!!error && <p>Pairing failed, please try again.</p>}
            </>
          )}
        </form>
        <button
          className="warning"
          onClick={() => {
            localStorage.removeItem('userToken');
            setUserToken(undefined);
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
}

export default App;
