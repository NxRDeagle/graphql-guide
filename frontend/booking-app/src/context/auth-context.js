import * as React from "react";

export default React.createContext({
  token: null,
  userId: null,
  // eslint-disable-next-line no-unused-vars
  login: (token, userId) => {},
  logout: () => {},
});
