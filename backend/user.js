const database = require("./database")
const passwordHash = require("password-hash");

async function createUser(name, password) {
    return new Promise((resolve, reject) => {
        getUser(name)
            .then(() => {
                reject(new Error("Username is busy"));
            })
            .catch(() => { // if not found than it's okay
                console.log(password);
                console.log(passwordHash.generate(password));
                return database.query(
                    "INSERT INTO tictaotoe_user (name, password) VALUES ($1, $2) RETURNING *",
                    [name, passwordHash.generate(password)]
                )
            })
            .then(result => {
                if (result.length === 1) {
                    resolve(result[0]);
                } else {
                    reject(new Error("Not Created"));
                }
            })
            .catch(() => {
                reject(new Error("Not Created"));
            });
    });
}

async function getUser(name) {
    return new Promise((resolve, reject) => {
        database.query('SELECT * FROM tictaotoe_user WHERE name=$1', [name])
            .then(value => {
                if (value.length === 1) {
                    resolve(value[0]);
                } else {
                    reject(new Error("Not found user"))
                }
            })
            .catch(() => {
                reject(new Error("Not found user"))
            });
    });
}

async function validatePassword(userFromAuth) {
    return new Promise((resolve, reject) => {
        getUser(userFromAuth.name)
            .then((user) => {
                console.log(user);
                if (passwordHash.verify(userFromAuth.pass, user.password)) {
                    resolve(user);
                } else {
                    reject(new Error("Password is not match"));
                }
            })
            .catch((reason) => {
                reject(reason);
            })
    });
}

module.exports = {
    createUser,
    getUser,
    validatePassword,
}