require('dotenv').config()

exports.dbConnection = callback = function () {
    var dbConfig = {
        user: process.env.DB_USERNAME, // SQL Server Login
        password: process.env.DB_PASSWORD, // SQL Server Password
        server: process.env.DB_HOST, // SQL Server Server name
        database: process.env.DB_DATABASE,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
          },
        options: {
            cryptoCredentialsDetails: {
                minVersion: 'TLSv1'
            },
            encrypt: false,
            trustServerCertificate: true
        }

        // user: process.env.DB_USERNAME, // SQL Server Login
        // password: process.env.DB_PASSWORD, // SQL Server Password
        // server: process.env.DB_HOST, // SQL Server Server name
        // database: process.env.DB_DATABASE, // SQL Server Database name
        // pool: {
        //     max: 10,
        //     min: 0,
        //     idleTimeoutMillis: 30000
        // },
        // options: {
        //     cryptoCredentialsDetails: {
        //         minVersion: 'TLSv1'
        //     },
        //     encrypt: false,
        //     trustServerCertificate: true,
        // }
    };
    return dbConfig;
};

// const sql = require('mssql')
// const sqlConfig = {
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   server: process.env.DB_HOST,
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   },
//   options: {
//     encrypt: true, // for azure
//     trustServerCertificate: false // change to true for local dev / self-signed certs
//   }
// }

// async () => {
//  try {
//   // make sure that any items are correctly URL encoded in the connection string
//   await sql.connect(sqlConfig)
//   const result = await sql.query`select * from users where id = 2`
//   console.dir(result)
//  } catch (err) {
//   // ... error checks
//  }
// }

// var Connection = require('tedious').Connection;  
// var config = {  
//     server: 'METAFORA\SQLEXPRESS',  //update me
//     authentication: {
//         type: 'default',
//             options: {
//                 userName: 'sa', //update me
//                 password: '@Brahma07!'  //update me
//             }
//         },
//         options: {
//             // If you are on Microsoft Azure, you need encryption:
//             encrypt: true,
//             trustServerCertificate: true,
//             database: 'webadmin'  //update me
//         }
// };  
// const sqlConnection = callback => {
//     var connection = new Connection(config);
//     connection.on('connect', function(err) {  
//         // If no error, then good to proceed.
//         console.log("Connected");  
//     });
    
//     connection.connect();
// }   

// module.exports = sqlConnection;
// const Sequelize = require('sequelize');
// const sequelize = new Sequelize('webadmin', 'sa', 'P@ssw0rd', {
//     host: 'METAFORA',
//     dialect: 'mssql',
//     dialectOptions: {
//         options: {
//             cryptoCredentialsDetails: {
//                 minVersion: 'TLSv1'
//             },
//             // trustedConnection: true,
//             // enableArithAbort: true,
//             trustServerCertificate: true
//         }
//     }
//   });

// const sqlConnection = callback => {
//     sequelize.authenticate().then((err) => {
//         console.log('Connection successful', err);
//     })
//     .catch((err) => {
//         console.log('Unable to connect to database', err);
//     });
// }   

// module.exports = sqlConnection;