'use strict'

const sql = require('mssql');
const dbConfig  = require('../utils/database');
const logger = require('../utils/logger');
const moment = require('moment');
const fs = require('fs');
const Table = require('easy-table');
const excel = require("exceljs");
const trails = require('../utils/trails');

async function getPrevillage(role_id){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT previllage FROM webadmin.previllages WHERE role_id='"+role_id+"'" ,function(err, results){
			const prev = [];
			for (let i = 0; i < results.recordset.length; i++) {
			  prev.push(results.recordset[i].previllage);
			}
			resolve(prev)
		  });
		})
		.catch(err => {
		  logger.error(err);
		})
	  });
	} catch (error) {
	  logger.error(error);
	}
}

exports.getIndex = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);

	let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 5, 18, 'Log Transaksi');

  try {
	if (prev.includes(44)) {
	await sql.connect(dbConfig.dbConnection())
	.then(query=>{
			res.render('log/statistik/index', {
				isAuthenticated: req.session.isLoggedIn,
				sessionUser: req.session.user,
				previllage: prev,
				data: [],
				from: '',
				to: '',
				year: '',
				errorMessage: message,
				moment:moment,
				path: 'log',
				subpath: 'statistik',
			});
		})
		.catch(err => {
				  logger.error(err);
			  })
		} else {
			return res.redirect('/404');
		  } 
		} catch (error) {
		  logger.error(error);
		}
	  };

exports.postFilterStatistik = async (req, res, next) => {
	const prev = await getPrevillage(req.session.user.role_id);

	const from = req.body.from;
	const to = req.body.to;
	const year = req.body.year;

	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 12, 18, 'Filter Log Transaksi');

	const conditions = [];

	if (from.length === 0 && to.length === 0 && year.length === 0) {
		req.flash('error', 'Silahkan pilih salah satu item untuk filter');
		return res.redirect('/log/statistik');
	}
	if (from.length !== 0 && to.length !== 0){
		conditions.length ? conditions.push(" AND MONTH(date) >= '"+from+"' AND MONTH(date) <= '"+to+"'") : conditions.push(" MONTH(date) >= '"+from+"' AND MONTH(date) <= '"+to+"'");
	}
	if (year.length !== 0){
		conditions.length ? conditions.push(" AND YEAR(date) = '"+year+"'") : conditions.push(" YEAR(date) = '"+year+"'");
	}
	
	// QUERY
	// SELECT 
	// 	mf.transactions,
	// 	SUM(CASE lt.status WHEN 'sukses' THEN 1 ELSE 0  END) AS sukses,
	// 	SUM(CASE lt.status WHEN 'gagal' THEN 1 ELSE 0  END) AS gagal,
	// 	SUM(CASE lt.status WHEN 'sukses' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_sukses,
	// 	SUM(CASE lt.status WHEN 'gagal' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_gagal
	// FROM webadmin.log_transaksi lt 
	// LEFT JOIN webadmin.m_fee mf ON mf.id = lt.jns_trx 
	// WHERE MONTH(lt.[date]) >= 1 and MONTH(lt.[date]) <= 4
	// GROUP BY mf.transactions  


	var q = "SELECT mf.transactions, SUM(CASE lt.status WHEN 'sukses' THEN 1 ELSE 0  END) AS sukses, "+
					"SUM(CASE lt.status WHEN 'gagal' THEN 1 ELSE 0  END) AS gagal, "+
					"SUM(CASE lt.status WHEN 'sukses' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_sukses, "+
					"SUM(CASE lt.status WHEN 'gagal' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_gagal "+
					"FROM webadmin.log_transaksi lt "+
					"LEFT JOIN webadmin.m_fee mf ON mf.id = lt.jns_trx "+
					"WHERE "+ conditions.join(' ') + " "+
					"GROUP BY mf.transactions";

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				res.render('log/statistik/index', {
					isAuthenticated: req.session.isLoggedIn,
					sessionUser: req.session.user,
					previllage: prev,
					data: results.recordset,
					from: from,
					to: to,
					year: year,
					errorMessage: '',
					moment:moment,
					path: 'log',
					subpath: 'statistik'
				});
			})
		})
	} catch (error) {
		
	}
}

async function createExcel(conditions) {	
	var q = "SELECT mf.transactions, SUM(CASE lt.status WHEN 'sukses' THEN 1 ELSE 0  END) AS sukses, "+
					"SUM(CASE lt.status WHEN 'gagal' THEN 1 ELSE 0  END) AS gagal, "+
					"SUM(CASE lt.status WHEN 'sukses' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_sukses, "+
					"SUM(CASE lt.status WHEN 'gagal' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_gagal "+
					"FROM webadmin.log_transaksi lt "+
					"LEFT JOIN webadmin.m_fee mf ON mf.id = lt.jns_trx "+
					"WHERE "+ conditions.join(' ') + " "+
					"GROUP BY mf.transactions";

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				let statistik = [];
				results.recordset.forEach((obj) => {
					statistik.push({
						transactions: obj.transactions,
						sukses: obj.sukses,
						total_sukses: obj.total_sukses,
						gagal: obj.gagal,
						total_gagal: obj.total_gagal
					});
				});
				let workbook = new excel.Workbook();
				let worksheet = workbook.addWorksheet("Statistik");
					
				worksheet.columns = [
					{ header: "Jenis Transaksi", key: "transactions", width: 25},
					{ header: "Jumlah Sukses", key: "sukses", width: 25 },
					{ header: "Nominal Sukses", key: "total_sukses", width: 25 },
					{ header: "Jumlah Gagal", key: "gagal", width: 25 },
					{ header: "Nominal Gagal", key: "total_gagal", width: 25 }
				];
				// Add Array Rows
				worksheet.addRows(statistik);
				workbook.xlsx.writeFile('log_statistik.xlsx');
			})
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.getExcel = async (req, res, next) => {
	const from = req.query.from;
	const to = req.query.to;
	const year = req.query.year;

	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 14, 18, 'Download Excel Log Transaksi');

	const conditions = [];

	if (from.length !== 0 && to.length !== 0){
		conditions.length ? conditions.push(" AND MONTH(date) >= '"+from+"' AND MONTH(date) <= '"+to+"'") : conditions.push(" MONTH(date) >= '"+from+"' AND MONTH(date) <= '"+to+"'");
	}
	if (year.length !== 0){
		conditions.length ? conditions.push(" AND YEAR(date) = '"+year+"'") : conditions.push(" YEAR(date) = '"+year+"'");
	}

	try {
		if (from.length === 0 && to.length === 0 && year.length === 0) {
			return res.json({
				'code': 404
			});
		} else {
			createExcel(conditions);
			return res.json({
				'code': 200,
			});
		}
	} catch (error) {
		logger.error(error);
	}
}

exports.getDownloadExcel = async (req, res, next) => {
	try {
		const file = fs.realpathSync('log_statistik.xlsx');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}

async function createTxt(conditions) {
	var q = "SELECT mf.transactions, SUM(CASE lt.status WHEN 'sukses' THEN 1 ELSE 0  END) AS sukses, "+
					"SUM(CASE lt.status WHEN 'gagal' THEN 1 ELSE 0  END) AS gagal, "+
					"SUM(CASE lt.status WHEN 'sukses' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_sukses, "+
					"SUM(CASE lt.status WHEN 'gagal' THEN CAST(replace(lt.nominal , '.', '') as int) ELSE 0 END) AS total_gagal "+
					"FROM webadmin.log_transaksi lt "+
					"LEFT JOIN webadmin.m_fee mf ON mf.id = lt.jns_trx "+
					"WHERE "+ conditions.join(' ') + " "+
					"GROUP BY mf.transactions";
	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				var t = new Table
		
				for (let i of results.recordset) {
					t.cell('Jenis Transaksi', i.transactions)
					t.cell('Jumlah Sukses', i.sukses)
					t.cell('Nominal Sukses', i.total_sukses)
					t.cell('Jumlah Gagal', i.gagal)
					t.cell('Nominal Gagal', i.total_gagal)
					t.newRow()
				}

				fs.writeFile("files/log_statistik.txt", t.toString(),"utf8", function(err) {
					if(err) {
						return logger.error(err);
					}
				});	
			})
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.getText = async (req, res, next) => {
	const from = req.query.from;
	const to = req.query.to;
	const year = req.query.year;

	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 15, 18, 'Download Txt Log Transaksi');

	const conditions = [];

	if (from.length !== 0 && to.length !== 0){
		conditions.length ? conditions.push(" AND MONTH(date) >= '"+from+"' AND MONTH(date) <= '"+to+"'") : conditions.push(" MONTH(date) >= '"+from+"' AND MONTH(date) <= '"+to+"'");
	}
	if (year.length !== 0){
		conditions.length ? conditions.push(" AND YEAR(date) = '"+year+"'") : conditions.push(" YEAR(date) = '"+year+"'");
	}

	try {
		if (from.length === 0 && to.length === 0 && year.length === 0) {
			return res.json({
				'code': 404
			})
		} else {
			createTxt(conditions)
		
			return res.json({
				'code': 200
			});
		}
	} catch (error) {
		logger.error(error)
	}
}

exports.getDownloadTxt = async (req, res, next) => {
	try {
		const file = fs.realpathSync('files/log_statistik.txt');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}