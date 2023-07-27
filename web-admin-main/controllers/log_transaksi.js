'use strict'

const sql = require('mssql');
const dbConfig = require('../utils/database');
const logger = require('../utils/logger');
const moment = require('moment');
const excel = require("exceljs");
const fs = require('fs');
const Table = require('easy-table');
const trails = require('../utils/trails');

async function getPrevillage(role_id) {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query("SELECT p.previllage FROM webadmin.previllages AS p WHERE p.role_id='" + role_id + "'", function (err, results) {
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

async function getJenis() {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query("SELECT id, transactions FROM webadmin.m_fee WHERE transactions IS NOT NULL", function (err, results) {
						resolve(results.recordset);
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
	const jenis = await getJenis();

	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}

	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 5, 17, 'Log Transaksi');

	try {
		if (prev.includes(41)) {
			 await sql.connect(dbConfig.dbConnection())
			 .then(query => {
					return sql.query(`SELECT lt.id, lt.date, lt.hours, transaction_type, mf.transactions AS jns_trx, lt.status, lt.rrn, lt.rek_number, lt.sender_name,
						lt.nominal, lt.fee, lt.rek_destination, lt.receiver_name, lt.bank_destination, lt.ket, lt.response		
						FROM webadmin.log_transaksi AS lt
						LEFT JOIN webadmin.m_fee AS mf ON mf.id = lt.jns_trx`);
					})
				.then(results => {
					res.render('log/transaksi/index', {
						isAuthenticated: req.session.isLoggedIn,
						sessionUser: req.session.user,
						previllage: prev,
						data: results.recordset,
						total_amount: 0,
						jenis: jenis,
						from: '',
						to: '',
						type: '',
						jns: '',
						status: '',
						moment:moment,
						path: 'log',
						subpath: 'transaksi',
						errorMessage: message,
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

exports.getFilterTransaksi = async (req, res, next) => {
	const prev = await getPrevillage(req.session.user.role_id);
	const jns = await getJenis();

	const from = req.body.from;
	const to = req.body.to;
	const type = req.body.type;
	const jenis = req.body.jenis;
	const status = req.body.status;

	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 12, 17, 'Filter Log Transaksi');

	const conditions = [];

	if (from.length === 0 && to.length === 0 && type.length === 0 && jenis.length === 0 && status.length === 0) {
		req.flash('error', 'Silahkan pilih salah satu item untuk filter');
		return res.redirect('/log/transaksi');
	}
	if (from.length !== 0 && to.length !== 0) {
		conditions.length ? conditions.push(" AND lt.date >= '" + from + "' AND lt.date < '" + to + "'") : conditions.push(" lt.date >= '" + from + "' AND lt.date < '" + to + "'");
	}
	if (type.length !== 0) {
		conditions.length ? conditions.push(" AND lt.transaction_type = '" + parseInt(type) + "'") : conditions.push(" lt.transaction_type = '" + parseInt(type) + "'");
	}
	if (jenis.length !== 0) {
		conditions.length ? conditions.push(" AND lt.jns_trx = '" + parseInt(jenis) + "'") : conditions.push(" lt.jns_trx = '" + parseInt(jenis) + "'");
	}
	if (status.length !== 0) {
		conditions.length ? conditions.push(" AND lt.status = '" + status + "'") : conditions.push(" lt.status = '" + status + "'");
	}

	var q = "SELECT lt.id, lt.date, lt.hours, transaction_type, mf.transactions AS jns_trx, lt.status, lt.rrn, lt.rek_number, lt.sender_name, lt.nominal, lt.fee, lt.rek_destination," +
		"lt.receiver_name, lt.bank_destination, lt.ket, lt.response FROM webadmin.log_transaksi AS lt " +
		"LEFT JOIN webadmin.m_fee AS mf ON mf.id = lt.jns_trx " +
		"WHERE " + conditions.join(' ');

	var total_amount = "SELECT SUM(CAST(REPLACE(lt.nominal, '.','') AS int)) AS total_amount FROM webadmin.log_transaksi lt WHERE " + conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
			.then(query => {
				sql.query(q)
					.then(results => {
						sql.query(total_amount)
							.then(amount => {
								res.render('log/transaksi/index', {
									isAuthenticated: req.session.isLoggedIn,
									sessionUser: req.session.user,
									previllage: prev,
									data: results.recordset,
									total_amount: amount.recordset[0].total_amount,
									jenis: jns,
									from: from,
									to: to,
									type: type,
									jns: jenis,
									status: status,
									errorMessage: '',
									moment: moment,
									path: 'log',
									subpath: 'transaksi'
								});
							})
					})
			})
	} catch (error) {
		logger.error(error);
	}
}

async function createExcel(conditions) {
	var q = "SELECT lt.id, lt.date, lt.hours, transaction_type, mf.transactions AS jns_trx, lt.status, lt.rrn, lt.rek_number, lt.sender_name, lt.nominal, lt.fee, lt.rek_destination," +
		"lt.receiver_name, lt.bank_destination, lt.ket, lt.response FROM webadmin.log_transaksi AS lt " +
		"LEFT JOIN webadmin.m_fee AS mf ON mf.id = lt.jns_trx " +
		"WHERE " + conditions.join(' ');

	var total_amount = "SELECT SUM(CAST(REPLACE(lt.nominal, '.','') AS int)) AS total_amount FROM webadmin.log_transaksi lt WHERE " + conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
			.then(query => {
				sql.query(q)
					.then(results => {
						sql.query(total_amount)
							.then(amount => {
								let transaksi = [];
								results.recordset.forEach((obj) => {
									transaksi.push({
										date: moment(obj.date).format('YYYY-MM-DD'),
										hours: moment(obj.hours).format('hh:mm:ss'),
										jns_trx: obj.jns_trx,
										status: obj.status,
										rrn: obj.rrn,
										rek_number: obj.rek_number,
										sender_name: obj.sender_name,
										nominal: obj.nominal,
										fee: obj.fee,
										rek_destination: obj.rek_destination,
										receiver_name: obj.receiver_name,
										bank_destination: obj.bank_destination,
										ket: obj.ket,
										response: obj.response,
									});
								});
								let workbook = new excel.Workbook();
								let worksheet = workbook.addWorksheet("Transaksi");

								worksheet.columns = [{
										header: "Tanggal",
										key: "date",
										width: 25
									},
									{
										header: "Jam",
										key: "hours",
										width: 25
									},
									{
										header: "Jenis Trx",
										key: "jns_trx",
										width: 25
									},
									{
										header: "Status",
										key: "status",
										width: 25
									},
									{
										header: "RRN",
										key: "rrn",
										width: 25
									},
									{
										header: "Rek Sumber",
										key: "rek_number",
										width: 25
									},
									{
										header: "Nama Pengirim",
										key: "sender_name",
										width: 25
									},
									{
										header: "Nominal",
										key: "nominal",
										width: 25
									},
									{
										header: "Fee",
										key: "fee",
										width: 25
									},
									{
										header: "Rek Tujuan",
										key: "rek_destination",
										width: 25
									},
									{
										header: "Nama Penerima",
										key: "receiver_name",
										width: 25
									},
									{
										header: "Bank Tujuan",
										key: "bank_destination",
										width: 25
									},
									{
										header: "Keterangan Trx",
										key: "ket",
										width: 25
									},
									{
										header: "Respon (RC)",
										key: "response",
										width: 25
									},
								];
								// Add Array Rows
								worksheet.addRows(transaksi);
								workbook.xlsx.writeFile('log_transaksi.xlsx');
							})
					})
			})
	} catch (error) {
		logger.error(error);
	}
}

exports.getExcel = async (req, res, next) => {
	const from = req.query.from;
	const to = req.query.to;
	const type = req.query.type;
	const jenis = req.query.jenis;
	const status = req.query.status;

	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 14, 17, 'Download Excel Log Transaksi');

	const conditions = [];

	if (from.length !== 0 && to.length !== 0) {
		conditions.length ? conditions.push(" AND lt.date >= '" + from + "' AND lt.date < '" + to + "'") : conditions.push(" lt.date >= '" + from + "' AND lt.date < '" + to + "'");
	}
	if (type.length !== 0) {
		conditions.length ? conditions.push(" AND lt.transaction_type = '" + type + "'") : conditions.push(" lt.transaction_type = '" + type + "'");
	}
	if (jenis.length !== 0) {
		conditions.length ? conditions.push(" AND lt.jns_trx = '" + jenis + "'") : conditions.push(" lt.jns_trx = '" + jenis + "'");
	}
	if (status.length !== 0) {
		conditions.length ? conditions.push(" AND lt.status = '" + status + "'") : conditions.push(" lt.status = '" + status + "'");
	}

	try {
		if (from.length === 0 && to.length === 0 && type.length === 0 && jenis.length === 0 && status.length === 0) {
			return res.json({
				'code': 404
			})
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
		
		const file = fs.realpathSync('log_transaksi.xlsx');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}

async function createTxt(conditions) {
	const total = [];

	var q = "SELECT lt.id, lt.date, lt.hours, transaction_type, mf.transactions AS jns_trx, lt.status, lt.rrn, lt.rek_number, lt.sender_name, lt.nominal, lt.fee, lt.rek_destination," +
		"lt.receiver_name, lt.bank_destination, lt.ket, lt.response FROM webadmin.log_transaksi AS lt " +
		"LEFT JOIN webadmin.m_fee AS mf ON mf.id = lt.jns_trx " +
		"WHERE " + conditions.join(' ');

	var total_amount = "SELECT SUM(CAST(REPLACE(lt.nominal, '.','') AS int)) AS total_amount FROM webadmin.log_transaksi lt WHERE " + conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
			.then(query => {
				sql.query(q)
					.then(results => {
						sql.query(total_amount)
							.then(amount => {
								var t = new Table

								for (let i = 0; i < results.recordset.length; i++) {
									t.cell('No', i + 1)
									t.cell('Tanggal', results.recordset[i].date ? moment(results.recordset[i].date).format('YYYY-MM-DD') : '-')
									t.cell('Jam', results.recordset[i].hours ? moment(results.recordset[i].hours).format('hh:mm:ss') : '-')
									t.cell('Jenis Trx', results.recordset[i].jns_trx)
									t.cell('Status', results.recordset[i].status)
									t.cell('RRN', results.recordset[i].rrn)
									t.cell('Rek Sumber', results.recordset[i].rek_number)
									t.cell('Nama Pengirim', results.recordset[i].sender_name)
									t.cell('Nominal', results.recordset[i].nominal)
									t.cell('Fee', results.recordset[i].fee)
									t.cell('Rek Tujuan', results.recordset[i].rek_destination)
									t.cell('Nama Penerima', results.recordset[i].receiver_name)
									t.cell('Bank Tujuan', results.recordset[i].bank_destination)
									t.cell('Keterangan Trx', results.recordset[i].ket)
									t.cell('Respon (RC)', results.recordset[i].response)
									t.newRow()
								}
								// add delimeter in last record
								t.pushDelimeter()

								total.push(results.recordset.length);
								total.push(amount.recordset[0].total_amount);

								fs.writeFile("files/log_transaksi.txt", t.toString(), "utf8", function (err) {
									if (err) {
										return logger.error(err);
									}

									var f = fs.createWriteStream('files/log_transaksi.txt', {
										flags: 'a' // 'a' means appending (old data will be preserved)
									})
									f.write('\n')
									f.write('TOTAL TRANSAKSI : ' + total[0] + '\n') // append string to your file
									f.write('TOTAL AMOUNT : ' + total[1])
									f.end() // close string
								});
							})
					})
			})
	} catch (error) {
		logger.error(error);
	}
}

exports.getText = async (req, res, next) => {
	const from = req.query.from;
	const to = req.query.to;
	const type = req.query.type;
	const jenis = req.query.jenis;
	const status = req.query.status;

	// send to audit trails
	trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 15, 17, 'Download Text Log Transaksi');

	const conditions = [];

	if (from.length !== 0 && to.length !== 0) {
		conditions.length ? conditions.push(" AND lt.date >= '" + from + "' AND lt.date < '" + to + "'") : conditions.push(" lt.date >= '" + from + "' AND lt.date < '" + to + "'");
	}
	if (type.length !== 0) {
		conditions.length ? conditions.push(" AND lt.transaction_type = '" + type + "'") : conditions.push(" lt.transaction_type = '" + type + "'");
	}
	if (jenis.length !== 0) {
		conditions.length ? conditions.push(" AND lt.jns_trx = '" + jenis + "'") : conditions.push(" lt.jns_trx = '" + jenis + "'");
	}
	if (status.length !== 0) {
		conditions.length ? conditions.push(" AND lt.status = '" + status + "'") : conditions.push(" lt.status = '" + status + "'");
	}
	// if (rek.length !== 0) {
	// 	conditions.length ? conditions.push(" AND lt.rek_number = '"+rek+"'") : conditions.push(" lt.rek_number = '"+rek+"'");
	// }

	try {
		if (from.length === 0 && to.length === 0 && type.length === 0 && jenis.length === 0 && status.length === 0) {
			return res.json({
				'code': 404
			})
		} else {
			createTxt(conditions)

			return res.json({
				'code': 200
			})
		}
	} catch (error) {
		logger.error(error)
	}
}

exports.getDownloadTxt = async (req, res, next) => {
	try {
		const file = fs.realpathSync('files/log_transaksi.txt');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}