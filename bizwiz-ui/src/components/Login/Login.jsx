import "./Login.css";
import { ThemeProvider } from "@emotion/react";
import { Button } from "@mui/material";
import Wizard from "../Welcome/Wizard.png";
import { useEffect } from "react";

export default function Login(props) {
  useEffect(() => {
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken.length > 0) window.location.replace("/");
    } catch {
      return;
    }
  });

  return (
    <div className="loginDiv">
      <section
        className="vh-100"
        style={{ backgroundColor: "rgb(75, 0, 130)" }}
      >
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-12 col-xl-11">
              <div className="card text-black" style={{ borderRadius: "25px" }}>
                <div className="card-body p-md-5">
                  <div className="row justify-content-center">
                    <div
                      className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1"
                      id="multipleItems"
                    >
                      <p
                        id="loginMessage"
                        className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4"
                      >
                        Log In
                      </p>

                      <form className="mx-1 mx-md-4">
                        <div className="d-flex flex-row align-items-center mb-4">
                          <i className="fas fa-envelope fa-lg me-3 fa-fw" />
                          <div className="form-outline flex-fill mb-0">
                            <input
                              type="email"
                              id="loginInput"
                              className="form-control"
                            />
                            <label className="form-label" htmlFor="loginInput">
                              Email
                            </label>
                          </div>
                        </div>

                        <div className="d-flex flex-row align-items-center mb-4">
                          <i className="fas fa-lock fa-lg me-3 fa-fw" />
                          <div className="form-outline flex-fill mb-0">
                            <input
                              type="password"
                              id="passInput"
                              className="form-control"
                            />
                            <label className="form-label" htmlFor="passInput">
                              Password
                            </label>
                          </div>
                        </div>

                        <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                          <ThemeProvider theme={props.purpleTheme}>
                            <Button
                              onClick={() => props.handleLogin()}
                              variant="contained"
                              style={{
                                color: "white",
                                width: "30%",
                                marginRight: "2%",
                                marginLeft: "2%",
                              }}
                            >
                              Log In
                            </Button>
                          </ThemeProvider>
                        </div>
                        <p id="signupOption">
                          Don't have an account? <a href="/signup">Sign up!</a>
                        </p>
                        <p id="returnResponse"></p>
                      </form>
                    </div>
                    <div
                      id="imageDiv"
                      className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2"
                    >
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
