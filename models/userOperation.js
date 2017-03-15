module.exports = function(sqlConnect) {
    var userOperation = new Object();

    //  TODO: 用户不能同名

    //  增
    userOperation.addUser = function(name, password) {
        //  TODO:需要做name和password的无害化处理
        var insertSQL = 'insert into users(name, password) values("'
            + name + '", "' + password + '")';
        sqlConnect.query(insertSQL, function (err1, res1) {
            if (err1) console.log(err1);
        });
    };

    //  查
    userOperation.queryAll = function() {
        return new Promise(function(resolve, reject) {
            sqlConnect.query('SELECT * FROM users', function(err, rows, fields) {
                if (err) reject(err);
                resolve(rows);
            });
        });
    };

    userOperation.queryUser = function(username) {
        //  TODO: username无害化处理
        return new Promise(function(resolve, reject) {
            var sqlExp = 'SELECT * FROM users WHERE name = ' +
                sqlConnect.escape(username);
            sqlConnect.query(sqlExp, function(err, rows, fields) {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    return userOperation;
}
