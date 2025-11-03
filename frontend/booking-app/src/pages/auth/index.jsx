import * as React from "react";
import authContext from "../../context/auth-context";
import { MAIN_URL } from "../../constants";
import "./auth.css";

const Auth = () => {
  const context = React.useContext(authContext);
  const [isLogin, setIsLogin] = React.useState(true);
  const emailRef = React.useRef();
  const passwordRef = React.useRef();

  const switchModeHandler = React.useCallback(() => {
    setIsLogin(!isLogin);
  }, [isLogin, setIsLogin]);

  const submitHandler = React.useCallback(
    (event) => {
      event.preventDefault();
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      if (email.trim().length === 0 || password.trim().length === 0) {
        return;
      }

      let requestBody = {
        query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
        variables: {
          email: email,
          password: password,
        },
      };

      if (!isLogin) {
        requestBody = {
          ...requestBody,
          query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}) {
              _id
              email
            }
          }
        `,
        };
      }

      fetch(MAIN_URL, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((result) => {
          if (result.status !== 200 && result.status !== 201) {
            throw new Error("Failed!");
          }
          return result.json();
        })
        .then((json) => {
          const { data } = json;
          const login = data?.login;
          if (login && login?.token) {
            context.login(login.token, login.userId);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    [context, emailRef, passwordRef, isLogin]
  );

  return (
    <form className="auth-form" onSubmit={submitHandler}>
      <div className="form-control">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" ref={emailRef} />
      </div>
      <div className="form-control">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" ref={passwordRef} />
      </div>
      <div className="form-actions">
        <button type="submit">Submit</button>
        <button type="button" onClick={switchModeHandler}>
          Switch to {isLogin ? "signup" : "login"}
        </button>
      </div>
    </form>
  );
};

export default Auth;
