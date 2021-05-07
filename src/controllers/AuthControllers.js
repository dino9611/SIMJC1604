const { mysqldb } = require("./../connection");
const {
  createAccessToken,
  createEmailVerifiedToken,
  createTokenRefresh,
  createTokenForget,
} = require("./../helpers/createToken");
const fs = require("fs");
const hashpass = require("./../helpers/hashingpass");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const path = require("path");
const handlebars = require("handlebars");
const transporter = require("./../helpers/transporter");
const dba = promisify(mysqldb.query).bind(mysqldb);
const jwt = require("jsonwebtoken");

const dbprom = (query, arr = []) => {
  return new Promise((resolve, reject) => {
    mysqldb.query(query, arr, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  login: async (req, res) => {
    try {
      const { emailorusername, password } = req.body;
      if (!emailorusername || !password) {
        return res.status(400).send({ message: "bad request" });
      }

      // mysqldb.query(sql,(err,result))
      let sql = `select idusers,username,email,isverified,role from users where (username= ? or email = ?) and password = ? `;
      const datauser = await dba(sql, [
        emailorusername,
        emailorusername,
        hashpass(password),
      ]);
      if (datauser.length) {
        // get cart user
        sql = `select id,p.* ,sum(i.qty) as stock ,od.qty
        from products p 
        join inventory i on p.idproducts = i.products_id
        join ordersdetail od on p.idproducts = od.products_id 
        where isdeleted= 0 and od.orders_id = 
                        (select idorders from orders 
                        where status = 'onCart' 
                        and users_id = ?)
        group by i.products_id`;
        let cart = await dba(sql, [datauser[0].idusers]);
        let dataToken = {
          idusers: datauser[0].idusers,
          username: datauser[0].username,
        };
        const tokenAccess = createAccessToken(dataToken);
        const tokenRefresh = createTokenRefresh(dataToken);
        res.set("x-token-access", tokenAccess);
        res.set("x-token-refresh", tokenRefresh);
        // kirim data
        return res.status(200).send({ ...datauser[0], cart: cart });
      } else {
        return res.status(500).send({ message: "username tidak terdaftar" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "server error" });
    }
  },
};
