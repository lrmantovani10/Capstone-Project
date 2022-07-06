import './Signup.css';
import '@fontsource/abel';
import { ThemeProvider } from '@emotion/react';
import { Button } from '@mui/material';
import Wizard from '../Welcome/Wizard.png';

export default function Signup(props) {
  return (
    <div className="signupDiv">
      <section className="vh-100" style={{ backgroundColor: 'rgb(75, 0, 130)' }}>
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-12 col-xl-11">
              <div className="card text-black" style={{ borderRadius: '25px' }}>
                <div className="card-body p-md-5">
                  <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1" id = "multipleItems">

                      <p id="signupMessage" className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>

                      <form className="mx-1 mx-md-4">

                        <div className="d-flex flex-row align-items-center mb-4">
                          <i className="fas fa-user fa-lg me-3 fa-fw" />
                          <div className="form-outline flex-fill mb-0">
                            <input type="text" id="nameInput" className="form-control" />
                            <label className="form-label" htmlFor="nameInput">Name</label>
                          </div>
                        </div>

                        <div className="d-flex flex-row align-items-center mb-4">
                          <i className="fas fa-envelope fa-lg me-3 fa-fw" />
                          <div className="form-outline flex-fill mb-0">
                            <input type="email" id="emailInput" className="form-control" />
                            <label className="form-label" htmlFor="emailInput">Email</label>
                          </div>
                        </div>

                        <div className="d-flex flex-row align-items-center mb-4">
                          <i className="fas fa-lock fa-lg me-3 fa-fw" />
                          <div className="form-outline flex-fill mb-0">
                            <input type="password" id="passwordInput" className="form-control" />
                            <label className="form-label" htmlFor="passwordInput">Password</label>
                          </div>
                        </div>

                        <div className="d-flex flex-row align-items-center mb-4">
                          <i className="fas fa-key fa-lg me-3 fa-fw" />
                          <div className="form-outline flex-fill mb-0">
                            <input type="password" id="repeatPasswordInput" className="form-control" />
                            <label className="form-label" htmlFor="repeatPasswordInput">Repeat your password</label>
                          </div>
                        </div>

                        <div className="form-check d-flex justify-content-center mb-5">
                          <input className="form-check-input me-2" type="checkbox" value="" id="signupBox" />
                          <label className="form-check-label" htmlFor="signupBox">
                            I agree with all statements in the terms of service
                          </label>
                        </div>
                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                          <ThemeProvider theme={props.purpleTheme}>
                            <Button
                              onClick={() => props.handleRegister()}
                              variant="contained"
                              style={{
                                color: 'white', width: '30%', marginRight: '2%', marginLeft: '2%',
                              }}
                            >
                              Register
                            </Button>
                          </ThemeProvider>
                        </div>
                        <p id="loginOption">Already have an account? <a href = "/login">Log In</a></p>
                        <p id='returnResponse'></p>
                      </form>

                    </div>
                    <div id="imageDiv" className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                      <img src={Wizard} className="img-fluid" alt="Wizard" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
