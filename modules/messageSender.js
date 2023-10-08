const axios = require("axios");

const sendMessage = (user) => {
  const apiUrl = process.env.API_BASE_URL + process.env.API_SEND_EMAIL;
  const requestBody = {
    email: user.email,
    message: `Hey, ${user.name} it's your ${user.type}`,
  };

  axios
    .post(apiUrl, requestBody)
    .then((response) => {
      console.log("API Response:", response.data);
    })
    .catch((error) => {
      console.error("API Error:", error);
    });
};

module.exports = {
  sendMessage,
};
