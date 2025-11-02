import * as React from "react";
import authContext from "../../context/auth-context";
import "./Auth.css";

const Auth = () => {
  const context = React.useContext(authContext);
  const [isLogin, setIsLogin] = React.useState(true);
  const emailRef = React.createRef();
  const passwordRef = React.createRef();

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

      fetch("http://localhost:3000/graphql", {
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
          if (data && data.login.token) {
            context.login(data.login.token, data.login.userId);
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
