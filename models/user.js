const mysql = require("mysql");
const moment = require("moment-timezone");
const connect = require("../config/connection");
const { MESSAGE_TYPES, SCHEDULER_TIME } = require("../config/scheduler");

const insert = (user) => {
  return new Promise((resolve, reject) => {
    connect.db.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        reject(err);
        return;
      }

      const usersData = {
        email: user[0],
        first_name: user[1],
        last_name: user[2],
        birthday_date: user[3],
        location: user[4],
      };

      connect.db.query("INSERT INTO users SET ?", usersData, (err, result1) => {
        if (err) {
          return connect.db.rollback(() => {
            console.error("Error inserting into users:", err);
            connect.db.end();
            reject(err);
          });
        }

        const scheduledMessagesData = {
          type: MESSAGE_TYPES.BIRTHDAY,
          user_id: result1.insertId,
          scheduled_time: getTimeSchedule(user[3], user[4]),
        };

        connect.db.query(
          "INSERT INTO scheduled_messages SET ?",
          scheduledMessagesData,
          (err, result2) => {
            if (err) {
              return connect.db.rollback(() => {
                console.error("Error inserting into scheduled_messages:", err);
                connect.db.end();
                reject(err);
              });
            }

            connect.db.commit((err) => {
              if (err) {
                return connect.db.rollback(() => {
                  console.error("Error committing transaction:", err);
                  connect.db.end();
                  reject(err);
                });
              }

              console.log("Transaction successfully committed.");
            });
          }
        );
        resolve(result1);
      });
    });
  });
};

const read = () => {
  return new Promise((resolve, reject) => {
    connect.db.query(`SELECT * FROM users`, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

const update = (user) => {
  return new Promise((resolve, reject) => {
    connect.db.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        reject(err);
        return;
      }

      connect.db.query(
        `UPDATE users SET email = ?, first_name = ?, last_name = ?, birthday_date = ?, location = ? WHERE id = ?`,
        user,
        (err, result1) => {
          if (err) {
            return connect.db.rollback(() => {
              console.error("Error updating into users:", err);
              connect.db.end();
              reject(err);
            });
          }

          connect.db.query(
            `UPDATE scheduled_messages SET scheduled_time = ? WHERE user_id = ?`,
            [getTimeSchedule(user[3], user[4]), user[5]],
            (err, result2) => {
              if (err) {
                return connect.db.rollback(() => {
                  console.error("Error updating into scheduled_messages:", err);
                  connect.db.end();
                  reject(err);
                });
              }

              // Commit the transaction
              connect.db.commit((err) => {
                if (err) {
                  return connect.db.rollback(() => {
                    console.error("Error committing transaction:", err);
                    connect.db.end();
                    reject(err);
                  });
                }

                console.log("Transaction successfully committed.");
              });
            }
          );
          resolve(result1);

          connect.db.end();
        }
      );
    });
  });
};

const remove = (userId) => {
  return new Promise((resolve, reject) => {
    connect.db.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        reject(err);
        return;
      }

      // Insert data into the first table
      connect.db.query(
        "DELETE FROM scheduled_messages WHERE user_id = ?",
        userId,
        (err, result1) => {
          if (err) {
            return connect.db.rollback(() => {
              console.error("Error deleting from scheduled_messages:", err);
              connect.db.end();
              reject(err);
            });
          }

          // Insert data into the second table
          connect.db.query(
            "DELETE FROM users WHERE id = ?",
            userId,
            (err, result2) => {
              if (err) {
                return connect.db.rollback(() => {
                  console.error("Error deleting from users:", err);
                  connect.db.end();
                  reject(err);
                });
              }

              // Commit the transaction
              connect.db.commit((err) => {
                if (err) {
                  return connect.db.rollback(() => {
                    console.error("Error committing transaction:", err);
                    connect.db.end();
                    reject(err);
                  });
                }

                console.log("Transaction successfully committed.");
              });
            }
          );
          resolve(result1);
        }
      );
    });
  });
};

const getTimeSchedule = (birthdayDate, location) => {
  const currentDate = new Date();
  const userBirthdayDate = new Date(birthdayDate);
  const currentUserBirthdayDate = `${currentDate.getFullYear()}-${
    userBirthdayDate.getMonth() + 1
  }-${userBirthdayDate.getDate()}`;
  const nextUserBirthdayDate = `${currentDate.getFullYear() + 1}-${
    userBirthdayDate.getMonth() + 1
  }-${userBirthdayDate.getDate()}`;

  const timeSchedule =
    new Date(currentDate) < new Date(currentUserBirthdayDate)
      ? `${currentUserBirthdayDate}`
      : `${nextUserBirthdayDate}`;

  const scheduleTime = moment.tz(timeSchedule, location).set({
    hour: SCHEDULER_TIME.HOUR,
    minute: SCHEDULER_TIME.MINUTE,
    second: SCHEDULER_TIME.SECOND,
  });

  return scheduleTime.format();
};

const scheduleMessage = (sendCallback) => {
  console.log("e");
  return new Promise((resolve, reject) => {
    connect.db.query(
      `SELECT * FROM scheduled_messages LEFT JOIN users ON scheduled_messages.user_id = users.id WHERE scheduled_time <= NOW()`,
      (err, result) => {
        if (err) {
          console.error("Error executing SQL query:", err);
          connection.end();
          return;
        }

        results.forEach((row) => {
          sendCallback({
            name: `${row.first_name} ${row.last_name}`,
            email: row.email,
            type: row.type,
          });
        });

        connection.end();
      }
    );
  });
};

module.exports = {
  insert,
  read,
  update,
  remove,
  scheduleMessage,
};
