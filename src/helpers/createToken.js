const jwt = require("jsonwebtoken");
//jc-6
module.exports = {
  createAccessToken: (data) => {
    const key = "saitamas";
    const token = jwt.sign(data, key, { expiresIn: "2h" });
    return token;
  },
  createEmailVerifiedToken: (data) => {
    const key = "king";
    const token = jwt.sign(data, key, { expiresIn: "1m" });
    return token;
  },
  createTokenRefresh: (data) => {
    const key = "puripuri";
    const token = jwt.sign(data, key);
    return token;
  },
  createTokenForget: (data) => {
    const key = "mumen";
    const token = jwt.sign(data, key, { expiresIn: "10m" });
    return token;
  },
};
