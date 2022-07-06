import './Welcome.css';
import logo from './Wizard.png';
import '@fontsource/abel';
import { ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';

export default function Welcome(props) {
  return (
    <div className="welcomeDiv">
      <h1 id="welcomeText">
        Welcome to BizWiz!
      </h1>
      <img src={logo} className="welcomeImage" alt="Wizard Logo" />
      <h2>
        We match job applicants to startups.
      </h2>
      <div className="accessButtons">
        <ThemeProvider theme={props.purpleTheme}>
          <Button id="welcome-btn1" href="/signup" variant="contained">Sign Up</Button>
          <Button
            id="welcome-btn2"
            href="/login"
            variant="light"
            style={{
              color: props.deepPurple[500], backgroundColor: 'white', width: '20%', marginRight: '2%', marginLeft: '2%',
            }}
          >
            Login
          </Button>
        </ThemeProvider>
      </div>
    </div>
  );
}
