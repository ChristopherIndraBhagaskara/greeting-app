const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }

  console.log("Connected to MySQL server");

  db.query("CREATE DATABASE IF NOT EXISTS greeting_db", (err) => {
    if (err) {
      console.error("Error creating database:", err);
      return;
    }

    db.query("USE greeting_db");

    const createUsersTable =
      "CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT, email VARCHAR(200) NOT NULL UNIQUE, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, birthday_date DATE NOT NULL, location VARCHAR(100) NOT NULL, PRIMARY KEY (id))";

    const createScheduledMessagesTable =
      "CREATE TABLE IF NOT EXISTS scheduled_messages (id INT NOT NULL AUTO_INCREMENT, type VARCHAR(100) NOT NULL, user_id INT(11) NOT NULL, scheduled_time DATETIME, PRIMARY KEY (id), CONSTRAINT scheduled_messages_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id))";

    db.query(createUsersTable, function (err, result) {
      if (err) throw err;
      if (result.affectedRows) console.log("Table users created");
    });

    db.query(createScheduledMessagesTable, function (err, result) {
      if (err) throw err;
      if (result.affectedRows) console.log("Table scheduled_messages created");
    });
  });
});

module.exports = {
  db,
};
