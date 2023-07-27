'use strict'

const sql = require('mssql');
const moment = require('moment');
const fs = require('fs');
const Table = require('easy-table');
const excel = require("exceljs");
const dbConfig  = require('../utils/database');

const logger = require('../utils/logger');
const trails = require('../utils/trails');

async function getPrevillage(role_id){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT p.previllage FROM webadmin.previllages AS p WHERE p.role_id='"+role_id+"'" ,function(err, results){
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

exports.getIndexCustomer = async (req, res, next) => {
  try {
		const prev = await getPrevillage(req.session.user.role_id);

    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 15, 'Reporting Laporan Customer IBMB');

    if (prev.includes(33)) {
      try {
        var branch = "SELECT c.branch FROM webadmin.customers c GROUP BY c.branch";

        await sql.connect(dbConfig.dbConnection())
        .then(query => {
          sql.query(branch)
          .then(result => {
            res.render('reporting/customer/index', {
              isAuthenticated: req.session.isLoggedIn,
              sessionUser: req.session.user,
              previllage: prev,
              branch: result.recordset,
              data: [],
              start_login: '',
              end_login: '',
              start_aktivasi: '',
              end_aktivasi: '',
              status_cif: '',
              ib: '',
              mb: '',
              cabang: '',
              jenis: '',
              status_rekening: '',
              status_transaksi: '',
              errorMessage: message,
              path: 'reporting',
              subpath: 'customer',
            });
          })
        });
      } catch (error) {
        logger.error(error);  
      }
    } else {
      return res.redirect('/404');
    }
  } catch (error) {
    logger.error(error);  
  }
};

exports.postFilterCustomer = async (req, res, next) => {
  const start_login = req.body.start_login;
  const end_login = req.body.end_login;
  const start_aktivasi = req.body.start_aktivasi;
  const end_aktivasi = req.body.end_aktivasi;
  const status_cif = req.body.status_cif;
  const ib = req.body.ib;
  const mb = req.body.mb;
  const cabang = req.body.cabang;
  const jenis = req.body.jenis;
  const status_rekening = req.body.status_rekening;
  const status_transaksi = req.body.status_transaksi;

  const prev = await getPrevillage(req.session.user.role_id);

	try {
		// send to audit trails
    // trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 15, 'Filter Reporting Laporan Customer IBMB');

    const conditions = [];

    if (start_login.length === 0 && end_login.length === 0 && start_aktivasi.length === 0 && end_aktivasi.length === 0 && status_cif.length === 0 
      && ib.length === 0 && mb.length === 0 && cabang.length === 0 && jenis.length === 0 && status_rekening.length === 0 && status_transaksi.length === 0) {
        req.flash('error', 'Silahkan pilih salah satu item untuk filter');
        return res.redirect('/reporting/customer');
    }
    if (start_login.length !== 0 && end_login.length !== 0){
      conditions.length ? conditions.push(" AND CAST(c.login_date AS DATE) >= '"+start_login+"' AND CAST(c.login_date AS DATE) <= '"+end_login+"'") : conditions.push(" CAST(c.login_date AS DATE) >= '"+start_login+"' AND CAST(c.login_date AS DATE) <= '"+end_login+"'");
    }
    if (start_aktivasi.length !== 0 && end_aktivasi.length !== 0){
      conditions.length ? conditions.push(" AND CAST(c.activation_date AS DATE) >= '"+start_aktivasi+"' AND CAST(c.activation_date AS DATE) <= '"+end_aktivasi+"'") : conditions.push(" CAST(c.activation_date AS DATE) >= '"+start_aktivasi+"' AND CAST(c.activation_date AS DATE) <= '"+end_aktivasi+"'");
    }
    if (ib.length !== 0){
      conditions.length ? conditions.push(" AND c.internet_banking = '"+ib+"'") : conditions.push(" c.internet_banking = '"+ib+"'");
    }
    if (mb.length !== 0){
      conditions.length ? conditions.push(" AND c.mobile_banking = '"+mb+"'") : conditions.push(" c.mobile_banking = '"+mb+"'");
    }
    if (status_cif.length !== 0){
      conditions.length ? conditions.push(" AND c.cif_status = '"+status_cif+"'") : conditions.push(" c.cif_status = '"+status_cif+"'");
    }
    if (cabang.length !== 0){
      conditions.length ? conditions.push(" AND c.branch = '"+cabang+"'") : conditions.push(" c.branch = '"+cabang+"'");
    }
    if (jenis.length !== 0){
      conditions.length ? conditions.push(" AND c.employee = '"+jenis+"'") : conditions.push(" c.employee = '"+jenis+"'");
    }
    if (status_rekening.length !== 0){
      conditions.length ? conditions.push(" AND c.rek_status = '"+status_rekening+"'") : conditions.push(" c.rek_status = '"+status_rekening+"'");
    }
    if (status_transaksi.length !== 0){
      conditions.length ? conditions.push(" AND c.transactions = '"+status_transaksi+"'") : conditions.push(" c.transactions = '"+status_transaksi+"'");
    }

    var q = "SELECT * FROM webadmin.customers c "+
			"WHERE "+ conditions.join(' ');

    var branch = "SELECT c.branch FROM webadmin.customers c GROUP BY c.branch";

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(result => {
        sql.query(branch)
        .then(b => {
          res.render('reporting/customer/index', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            previllage: prev,
            branch: b.recordset,
            data: result.recordset,
            start_login: start_login,
            end_login: end_login,
            start_aktivasi: start_aktivasi,
            end_aktivasi: end_aktivasi,
            status_cif: status_cif,
            ib: ib,
            mb: mb,
            cabang: cabang,
            jenis: jenis,
            status_rekening: status_rekening,
            status_transaksi: status_transaksi,
            errorMessage: '',
            moment: moment,
            path: 'reporting',
            subpath: 'customer',
          });
        })
			})
			.catch(err => {
				logger.error(err);
			});
		});
	} catch (error) {
		logger.error(error);
	}
};

async function createExcelCustomer(conditions) {	
	var q = "SELECT * FROM webadmin.customers c "+
			"WHERE "+ conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				let statistik = [];
				results.recordset.forEach((obj) => {
					statistik.push({
            login_date: obj.login_date ? moment(obj.login_date).format('LL') : '-',
            activation_date: obj.activation_date ? moment(obj.activation_date).format('LL') : '-',
            username: obj.username,
            name: obj.name,
            rek_number: obj.rek_number,
            cif: obj.cif,
            card_number: obj.card_number,
            internet_banking: obj.internet_banking,
            mobile_banking: obj.mobile_banking,
            email: obj.email,
            no_telp: obj.no_telp,
            serial_token: obj.serial_token,
            link_token_date: obj.link_token_date ? moment(obj.link_token_date).format('LL') : '-',
            branch: obj.branch,
            branch_code: obj.branch_code,
            employee: obj.employee,
            cif_status: obj.cif_status,
            rek_status: obj.rek_status,
            transactions: obj.transactions
					});
				});
				let workbook = new excel.Workbook();
				let worksheet = workbook.addWorksheet("Statistik");
				
				worksheet.columns = [
					{ header: "Tgl Login Terahir", key: "login_date", width: 25},
					{ header: "Tgl Aktivasi", key: "activation_date", width: 25 },
					{ header: "Username", key: "username", width: 25 },
					{ header: "Nama", key: "name", width: 25 },
					{ header: "No. Rek", key: "rek_number", width: 25 },
          { header: "CIF", key: "cif", width: 25},
					{ header: "Nomer Kartu", key: "card_number", width: 25 },
					{ header: "Internet Banking", key: "internet_banking", width: 25 },
					{ header: "Mobile Banking", key: "mobile_banking", width: 25 },
					{ header: "Email", key: "email", width: 25 },
          { header: "No. Telp", key: "no_telp", width: 25},
					{ header: "Serial Token", key: "serial_token", width: 25 },
					{ header: "Tgl Link Token", key: "link_token_date", width: 25 },
					{ header: "Cabang", key: "branch", width: 25 },
					{ header: "Kode Cabang", key: "branch_code", width: 25 },
          { header: "Nasabah / Karyawan", key: "employee", width: 25 },
					{ header: "Status CIF", key: "cif_status", width: 25 },
					{ header: "Status Rekening", key: "rek_status", width: 25 },
					{ header: "Transaksi", key: "transactions", width: 25 },
				];
				// Add Array Rows
				worksheet.addRows(statistik);
				workbook.xlsx.writeFile('Reporting_Customer_IBMB.xlsx');
			})
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.getExcel = async (req, res, next) => {
	const start_login = req.query.start_login;
  const end_login = req.query.end_login;
  const start_aktivasi = req.query.start_aktivasi;
  const end_aktivasi = req.query.end_aktivasi;
  const status_cif = req.query.status_cif;
  const ib = req.query.ib;
  const mb = req.query.mb;
  const cabang = req.query.cabang;
  const jenis = req.query.jenis;
  const status_rekening = req.query.status_rekening;
  const status_transaksi = req.query.status_transaksi;

	const conditions = [];

	if (start_login.length !== 0 && end_login.length !== 0){
    conditions.length ? conditions.push(" AND CAST(c.login_date AS DATE) >= '"+start_login+"' AND CAST(c.login_date AS DATE) <= '"+end_login+"'") : conditions.push(" CAST(c.login_date AS DATE) >= '"+start_login+"' AND CAST(c.login_date AS DATE) <= '"+end_login+"'");
  }
  if (start_aktivasi.length !== 0 && end_login.length !== 0){
    conditions.length ? conditions.push(" AND CAST(c.activation_date AS DATE) >= '"+start_aktivasi+"' AND CAST(c.activation_date AS DATE) <= '"+end_aktivasi+"'") : conditions.push(" CAST(c.activation_date AS DATE) >= '"+start_aktivasi+"' AND CAST(c.activation_date AS DATE) <= '"+end_aktivasi+"'");
  }
  if (ib.length !== 0){
    conditions.length ? conditions.push(" AND c.internet_banking = '"+ib+"'") : conditions.push(" c.internet_banking = '"+ib+"'");
  }
  if (mb.length !== 0){
    conditions.length ? conditions.push(" AND c.mobile_banking = '"+mb+"'") : conditions.push(" c.mobile_banking = '"+mb+"'");
  }
  if (status_cif.length !== 0){
    conditions.length ? conditions.push(" AND c.cif_status = '"+status_cif+"'") : conditions.push(" c.cif_status = '"+status_cif+"'");
  }
  if (cabang.length !== 0){
    conditions.length ? conditions.push(" AND c.branch = '"+cabang+"'") : conditions.push(" c.branch = '"+cabang+"'");
  }
  if (jenis.length !== 0){
    conditions.length ? conditions.push(" AND c.employee = '"+jenis+"'") : conditions.push(" c.employee = '"+jenis+"'");
  }
  if (status_rekening.length !== 0){
    conditions.length ? conditions.push(" AND c.rek_status = '"+status_rekening+"'") : conditions.push(" c.rek_status = '"+status_rekening+"'");
  }
  if (status_transaksi.length !== 0){
    conditions.length ? conditions.push(" AND c.transactions = '"+status_transaksi+"'") : conditions.push(" c.transactions = '"+status_transaksi+"'");
  }

	try {
    if (start_login.length === 0 && end_login.length === 0 && start_aktivasi.length === 0 && end_login.length === 0 && status_cif.length === 0 && ib.length === 0
      && mb.length === 0 && cabang.length === 0 && jenis.length === 0 && status_rekening.length === 0 && status_transaksi.length === 0) {
      return res.json({
        'code': 404
      })
    } else {
      createExcelCustomer(conditions);
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
		const file = fs.realpathSync('Reporting_Customer_IBMB.xlsx');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}

async function createTxt(conditions) {
	var q = "SELECT * FROM webadmin.customers c "+
			"WHERE "+ conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				var t = new Table
		
				for (let i of results.recordset) {
					t.cell('Tgl Login Terahir', i.login_date ? moment(i.login_date).format('LL') : '-')
					t.cell('Tgl Aktivasi', i.activation_date ? moment(i.activation_date).format('LL') : '-')
					t.cell('Username', i.username)
					t.cell('Nama', i.name)
          t.cell('No. Rek', i.rek_number)
					t.cell('CIF', i.cif)
					t.cell('Nomer Kartu', i.card_number)
					t.cell('Internet Banking', i.internet_banking)
					t.cell('Mobile Banking', i.mobile_banking)
          t.cell('Email', i.email)
					t.cell('No. Telp', i.no_telp)
          t.cell('Serial Token', i.serial_token)
					t.cell('Tgl Link Token', i.link_token_date)
          t.cell('Cabang', i.branch)
					t.cell('Kode Cabang', i.branch_code)
          t.cell('Nasabah / Karyawan', i.employee)
					t.cell('Status CIF', i.cif_status)
          t.cell('Status Rekening', i.rek_status)
					t.cell('Transaksi', i.transactions)
					t.newRow()
				}

				fs.writeFile("files/reporting_customer_ibmb.txt", t.toString(),"utf8", function(err) {
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
	const start_login = req.query.start_login;
  const end_login = req.query.end_login;
  const start_aktivasi = req.query.start_aktivasi;
  const end_aktivasi = req.query.end_aktivasi;
  const status_cif = req.query.status_cif;
  const ib = req.query.ib;
  const mb = req.query.mb;
  const cabang = req.query.cabang;
  const jenis = req.query.jenis;
  const status_rekening = req.query.status_rekening;
  const status_transaksi = req.query.status_transaksi;

	const conditions = [];

	if (start_login.length !== 0 && end_login.length !== 0){
    conditions.length ? conditions.push(" AND CAST(c.login_date AS DATE) >= '"+start_login+"' AND CAST(c.login_date AS DATE) <= '"+end_login+"'") : conditions.push(" CAST(c.login_date AS DATE) >= '"+start_login+"' AND CAST(c.login_date AS DATE) <= '"+end_login+"'");
  }
  if (start_aktivasi.length !== 0 && end_login.length !== 0){
    conditions.length ? conditions.push(" AND CAST(c.activation_date AS DATE) >= '"+start_aktivasi+"' AND CAST(c.activation_date AS DATE) <= '"+end_aktivasi+"'") : conditions.push(" CAST(c.activation_date AS DATE) >= '"+start_aktivasi+"' AND CAST(c.activation_date AS DATE) <= '"+end_aktivasi+"'");
  }
  if (ib.length !== 0){
    conditions.length ? conditions.push(" AND c.internet_banking = '"+ib+"'") : conditions.push(" c.internet_banking = '"+ib+"'");
  }
  if (mb.length !== 0){
    conditions.length ? conditions.push(" AND c.mobile_banking = '"+mb+"'") : conditions.push(" c.mobile_banking = '"+mb+"'");
  }
  if (status_cif.length !== 0){
    conditions.length ? conditions.push(" AND c.cif_status = '"+status_cif+"'") : conditions.push(" c.cif_status = '"+status_cif+"'");
  }
  if (cabang.length !== 0){
    conditions.length ? conditions.push(" AND c.branch = '"+cabang+"'") : conditions.push(" c.branch = '"+cabang+"'");
  }
  if (jenis.length !== 0){
    conditions.length ? conditions.push(" AND c.employee = '"+jenis+"'") : conditions.push(" c.employee = '"+jenis+"'");
  }
  if (status_rekening.length !== 0){
    conditions.length ? conditions.push(" AND c.rek_status = '"+status_rekening+"'") : conditions.push(" c.rek_status = '"+status_rekening+"'");
  }
  if (status_transaksi.length !== 0){
    conditions.length ? conditions.push(" AND c.transactions = '"+status_transaksi+"'") : conditions.push(" c.transactions = '"+status_transaksi+"'");
  }


	try {
    if (start_login.length === 0 && end_login.length === 0 && start_aktivasi.length === 0 && end_login.length === 0 && status_cif.length === 0 && ib.length === 0
      && mb.length === 0 && cabang.length === 0 && jenis.length === 0 && status_rekening.length === 0 && status_transaksi.length === 0) {
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
		const file = fs.realpathSync('files/reporting_customer_ibmb.txt');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}

// Channel
async function groupChannel(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT t.channel FROM webadmin.transctions t GROUP BY t.channel" ,function(err, results){
			  resolve(results.recordset)
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

async function groupTransaction(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT t.transactions FROM webadmin.transctions t GROUP BY t.transactions" ,function(err, results){
		  resolve(results.recordset)
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

async function groupBranch(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT t.branch FROM webadmin.transctions t GROUP BY t.branch" ,function(err, results){
			  resolve(results.recordset)
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

async function groupType(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT t.type FROM webadmin.transctions t GROUP BY t.type" ,function(err, results){
			  resolve(results.recordset)
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

// Reporting Transaction IBMB
exports.getIndexTransaction = async (req, res, next) => {
  try {
		const prev = await getPrevillage(req.session.user.role_id);

    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 16, 'Reporting Laporan Transaksi IBMB');

    if (prev.includes(36)) {
      try {
        const ch = await groupChannel();
        const trans = await groupTransaction();
        const branch = await groupBranch();
        const type = await groupType();

        await sql.connect(dbConfig.dbConnection())
        .then(query => {
          res.render('reporting/transaksi/index', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            previllage: prev,
            branch: branch,
            ch: ch,
            trans: trans,
            type: type,
            data: [],
            start_date: '',
            end_date: '',
            channel: '',
            transaksi: '',
            cabang: '',
            jenis: '',
            errorMessage: message,
            path: 'reporting',
            subpath: 'transaksi',
          });
        });
      } catch (error) {
        logger.error(error); 
      }
    } else {
			return res.redirect('/404');
		} 
  } catch (error) {
    logger.error(error);  
  }
};

exports.postFilterTransaksi = async (req, res, next) => {
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const channel = req.body.channel;
  const transaksi = req.body.transaksi;
  const cabang = req.body.cabang;
  const jenis = req.body.jenis;

  const prev = await getPrevillage(req.session.user.role_id);
  const ch = await groupChannel();
  const trans = await groupTransaction();
  const branch = await groupBranch();
  const type = await groupType();

	try {
		// send to audit trails
    // trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 4, 'Filter Reporting Laporan Customer IBMB');

    const conditions = [];

    if (start_date.length === 0 && end_date.length === 0 && channel.length === 0 && transaksi.length === 0 && cabang.length === 0 && jenis.length === 0) {
      req.flash('error', 'Silahkan pilih salah satu item untuk filter');
      return res.redirect('/reporting/transaksi');
    }
    if (start_date.length !== 0 && end_date.length !== 0){
      conditions.length ? conditions.push(" AND CAST(t.dates AS DATE) >= '"+start_date+"' AND CAST(t.dates AS DATE) <= '"+end_date+"'") : conditions.push(" CAST(t.dates AS DATE) >= '"+start_date+"' AND CAST(t.dates AS DATE) <= '"+end_date+"'");
    }
    if (channel.length !== 0){
      conditions.length ? conditions.push(" AND t.channel = '"+channel+"'") : conditions.push(" t.channel = '"+channel+"'");
    }
    if (transaksi.length !== 0){
      conditions.length ? conditions.push(" AND t.transactions = '"+transaksi+"'") : conditions.push(" t.transactions = '"+transaksi+"'");
    }
    if (cabang.length !== 0){
      conditions.length ? conditions.push(" AND t.branch = '"+cabang+"'") : conditions.push(" t.branch = '"+cabang+"'");
    }
    if (jenis.length !== 0){
      conditions.length ? conditions.push(" AND t.type = '"+jenis+"'") : conditions.push(" t.type = '"+jenis+"'");
    }
    
    var q = "SELECT * FROM webadmin.transctions t "+
			"WHERE "+ conditions.join(' ');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(result => {
        res.render('reporting/transaksi/index', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          previllage: prev,
          branch: branch,
          ch: ch,
          trans: trans,
          type: type,
          data: result.recordset,
          start_date: start_date,
          end_date: end_date,
          channel: channel,
          transaksi: transaksi,
          cabang: cabang,
          jenis: jenis,
          errorMessage: '',
          moment: moment,
          path: 'reporting',
          subpath: 'transaksi',
        });
			})
			.catch(err => {
				logger.error(err);
			});
		});
	} catch (error) {
		logger.error(error);
	}
};

async function createExcel(conditions) {	
	var q = "SELECT * FROM webadmin.transctions t "+
			"WHERE "+ conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				let statistik = [];
				results.recordset.forEach((obj) => {
					statistik.push({
            dates: obj.dates ? moment(obj.dates).format('lll') : '-',
            channel: obj.channel,
            cif: obj.cif,
            username: obj.username,
            name: obj.name,
            no_ref: obj.no_ref,
            no_rek: obj.no_rek,
            transactions: obj.transactions,
            code_destinations_bank: obj.code_destinations_bank,
            biller_destinations_bank: obj.biller_destinations_bank,
            ket: obj.ket,
            nominal: obj.nominal,
            fee: obj.fee,
            status: obj.status,
            ket_failed: obj.ket_failed,
            rek_type: obj.rek_type,
            branch_code: obj.branch_code,
            branch: obj.branch,
            type: obj.type
					});
				});
				let workbook = new excel.Workbook();
				let worksheet = workbook.addWorksheet("Statistik");
				
				worksheet.columns = [
					{ header: "Tanggal", key: "dates", width: 25},
					{ header: "Channel", key: "channel", width: 25 },
					{ header: "CIF", key: "cif", width: 25 },
					{ header: "Username", key: "username", width: 25 },
					{ header: "Nama", key: "name", width: 25 },
          { header: "No. Referensi", key: "no_ref", width: 25},
					{ header: "No. Rekening", key: "no_rek", width: 25 },
					{ header: "Transaksi", key: "transactions", width: 25 },
					{ header: "Kode Bank Tujuan", key: "code_destinations_bank", width: 25 },
					{ header: "Bank Tujuan Biller", key: "biller_destinations_bank", width: 25 },
          { header: "Keterangan", key: "ket", width: 25},
					{ header: "Nominal", key: "nominal", width: 25 },
					{ header: "Fee", key: "fee", width: 25 },
					{ header: "Status", key: "status", width: 25 },
					{ header: "Keterangan Gagal", key: "ket_failed", width: 25 },
          { header: "Jenis Rekening", key: "rek_type", width: 25 },
					{ header: "Kode Cabang", key: "branch_code", width: 25 },
					{ header: "Cabang", key: "branch", width: 25 },
					{ header: "Jenis", key: "type", width: 25 },
				];
				// Add Array Rows
				worksheet.addRows(statistik);
				workbook.xlsx.writeFile('Reporting_Transaksi_IBMB.xlsx');
			})
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.getTransaksiExcel = async (req, res, next) => {
	const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const channel = req.query.channel;
  const transaksi = req.query.transaksi;
  const cabang = req.query.cabang;
  const jenis = req.query.jenis;

	const conditions = [];

  if (start_date.length !== 0 && end_date.length !== 0){
    conditions.length ? conditions.push(" AND CAST(t.dates AS DATE) >= '"+start_date+"' AND CAST(t.dates AS DATE) <= '"+end_date+"'") : conditions.push(" CAST(t.dates AS DATE) >= '"+start_date+"' AND CAST(t.dates AS DATE) <= '"+end_date+"'");
  }
  if (channel.length !== 0){
    conditions.length ? conditions.push(" AND t.channel = '"+channel+"'") : conditions.push(" t.channel = '"+channel+"'");
  }
  if (transaksi.length !== 0){
    conditions.length ? conditions.push(" AND t.transactions = '"+transaksi+"'") : conditions.push(" t.transactions = '"+transaksi+"'");
  }
  if (cabang.length !== 0){
    conditions.length ? conditions.push(" AND t.branch = '"+cabang+"'") : conditions.push(" t.branch = '"+cabang+"'");
  }
  if (jenis.length !== 0){
    conditions.length ? conditions.push(" AND t.type = '"+jenis+"'") : conditions.push(" t.type = '"+jenis+"'");
  }

	try {
    if (start_date.length === 0 && end_date.length === 0 && channel.length === 0 && transaksi.length === 0 && cabang.length === 0 && jenis.length === 0) {
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

exports.getDownloadTransaksiExcel = async (req, res, next) => {
	try {
		const file = fs.realpathSync('Reporting_Transaksi_IBMB.xlsx');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}

async function createTransaksiTxt(conditions) {
	var q = "SELECT * FROM webadmin.transctions t "+
			"WHERE "+ conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				var t = new Table
		
				for (let i of results.recordset) {
					t.cell('Tanggal', i.dates ? moment(i.dates).format('lll') : '-')
					t.cell('Channel', i.channel)
					t.cell('CIF', i.cif)
					t.cell('Username', i.username)
          t.cell('Nama  ', i.name)
					t.cell('No. Referensi', i.no_ref)
					t.cell('No. Rekening', i.no_rek)
					t.cell('Transaksi', i.transactions)
					t.cell('Kode Bank Tujuan', i.code_destinations_bank)
          t.cell('Bank Tujuan Biller', i.biller_destinations_bank)
					t.cell('Keterangan', i.ket)
          t.cell('Nominal', i.nominal)
					t.cell('Fee', i.fee)
          t.cell('Status', i.status)
					t.cell('Keterangan Gagal', i.ket_failed)
          t.cell('Jenis Rekening', i.rek_type)
					t.cell('Kode Cabang', i.branch_code)
          t.cell('Cabang', i.branch)
					t.cell('Jenis', i.type)
					t.newRow()
				}

				fs.writeFile("files/reporting_transaksi_ibmb.txt", t.toString(),"utf8", function(err) {
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

exports.getTransaksiText = async (req, res, next) => {
	const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const channel = req.query.channel;
  const transaksi = req.query.transaksi;
  const cabang = req.query.cabang;
  const jenis = req.query.jenis;

	const conditions = [];

  if (start_date.length !== 0 && end_date.length !== 0){
    conditions.length ? conditions.push(" AND CAST(t.dates AS DATE) >= '"+start_date+"' AND CAST(t.dates AS DATE) <= '"+end_date+"'") : conditions.push(" CAST(t.dates AS DATE) >= '"+start_date+"' AND CAST(t.dates AS DATE) <= '"+end_date+"'");
  }
  if (channel.length !== 0){
    conditions.length ? conditions.push(" AND t.channel = '"+channel+"'") : conditions.push(" t.channel = '"+channel+"'");
  }
  if (transaksi.length !== 0){
    conditions.length ? conditions.push(" AND t.transactions = '"+transaksi+"'") : conditions.push(" t.transactions = '"+transaksi+"'");
  }
  if (cabang.length !== 0){
    conditions.length ? conditions.push(" AND t.branch = '"+cabang+"'") : conditions.push(" t.branch = '"+cabang+"'");
  }
  if (jenis.length !== 0){
    conditions.length ? conditions.push(" AND t.type = '"+jenis+"'") : conditions.push(" t.type = '"+jenis+"'");
  }

	try {
    if (start_date.length === 0 && end_date.length === 0 && channel.length === 0 && transaksi.length === 0 && cabang.length === 0 && jenis.length === 0) {
      return res.json({
        'code': 404
      })
    } else {
      createTransaksiTxt(conditions)
		
      return res.json({
        'code': 200
      })
    }
	} catch (error) {
		logger.error(error)
	}
}

exports.getDownloadTransaksiTxt = async (req, res, next) => {
	try {
		const file = fs.realpathSync('files/reporting_transaksi_ibmb.txt');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}

// Get Transaction abnormal
async function groupAbnormalTransaction(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT transactions FROM webadmin.abnormal_bi_fast GROUP BY transactions" ,function(err, results){
			  resolve(results.recordset)
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

// Get Group Response
async function groupAbnormalResponse(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT responses FROM webadmin.abnormal_bi_fast GROUP BY responses" ,function(err, results){
			  resolve(results.recordset)
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

// Transaction Abnormal BI FAST
exports.getIndexAbnormal = async (req, res, next) => {
  try {
		const prev = await getPrevillage(req.session.user.role_id);
    const abnormalTrans = await groupAbnormalTransaction();
    const response = await groupAbnormalResponse();

    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 22, 'Reporting Laporan Transaksi Abnormal');

    if (prev.includes(49)) {
      try {
        res.render('reporting/abnormal/index', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          previllage: prev,
          data: [],
          list_transaction: abnormalTrans,
          list_response : response,
          transaction: '',
          dates: '',
          responses: '',
          errorMessage: message,
          moment: moment,
          path: 'reporting',
          subpath: 'abnormal',
        });
      } catch (error) {
        logger.error(error); 
      }
    } else {
			return res.redirect('/404');
		} 
  } catch (error) {
    logger.error(error);  
  }
}

exports.postFilterAbnormal = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);

  const transaction = req.body.transaction;
  const dates = req.body.dates;
  const responses = req.body.responses;

  const abnormalTrans = await groupAbnormalTransaction();
  const response = await groupAbnormalResponse();

  try {
    const conditions = [];

    if (transaction.length === 0 && dates.length === 0 && responses.length === 0) {
      req.flash('error', 'Silahkan pilih salah satu item untuk filter');
      return res.redirect('/reporting/abnormal');
    }
    if (transaction.length !== 0){
      conditions.length ? conditions.push(" AND abf.transactions = '"+transaction+"'") : conditions.push(" abf.transactions = '"+transaction+"'");
    }
    if (dates.length !== 0){
      conditions.length ? conditions.push(" AND CAST(abf.dates AS DATE) <= '"+dates+"'") : conditions.push(" CAST(abf.dates AS DATE) = '"+dates+"'");
    }
    if (responses.length !== 0){
      conditions.length ? conditions.push(" AND abf.responses = '"+responses+"'") : conditions.push(" abf.responses = '"+responses+"'");
    }
    
    var q = "SELECT * FROM webadmin.abnormal_bi_fast abf "+
			"WHERE "+ conditions.join(' ');
    
    await sql.connect(dbConfig.dbConnection())
      .then(query => {
        sql.query(q)
        .then(result => {
          res.render('reporting/abnormal/index', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            previllage: prev,
            list_transaction: abnormalTrans,
            list_response : response,
            transaction: transaction,
            dates: dates,
            responses: responses,
            data: result.recordset,
            errorMessage: '',
            moment: moment,
            path: 'reporting',
            subpath: 'abnormal',
          });
        })
        .catch(err => {
          logger.error(err);
        });
      });
  } catch (error) {
    logger.error(error);
  }
}

async function buildExcel(conditions) {	
	var q = "SELECT * FROM webadmin.abnormal_bi_fast abf "+
			"WHERE "+ conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				let statistik = [];
				results.recordset.forEach((obj) => {
					statistik.push({
            transactions: obj.transactions,
            dates: obj.dates ? moment(obj.dates).format('L') : '-',
            hours: obj.hours,
            trace_num_core_banking: obj.trace_num_core_banking,
            user_id_core_banking: obj.user_id_core_banking,
            rek_core_banking: obj.rek_core_banking,
            rintis_transaction_id: obj.rintis_transaction_id,
            rintis_no_ref: obj.rintis_no_ref,
            rintis_rek_origin: obj.rintis_rek_origin,
            rintis_rek_destinations: obj.rintis_rek_destinations,
            nominal: obj.nominal,
            responses: obj.responses
					});
				});
				let workbook = new excel.Workbook();
				let worksheet = workbook.addWorksheet("Report");
				
				worksheet.columns = [
          { header: "Transaksi", key: "transactions", width: 25},
					{ header: "Tanggal", key: "dates", width: 25},
					{ header: "Jam", key: "hours", width: 25 },
					{ header: "No Trace", key: "trace_num_core_banking", width: 25 },
					{ header: "User ID", key: "user_id_core_banking", width: 25 },
					{ header: "Rekening", key: "rek_core_banking", width: 25 },
          { header: "E2e / ID Transaksi", key: "rintis_transaction_id", width: 25},
					{ header: "No Referensi", key: "rintis_no_ref", width: 25 },
					{ header: "Rekening Sumber", key: "rintis_rek_origin", width: 25 },
					{ header: "Rekening Tujuan", key: "rintis_rek_destinations", width: 25 },
					{ header: "Nominal", key: "nominal", width: 25 },
          { header: "Respon", key: "responses", width: 25}
				];
				// Add Array Rows
				worksheet.addRows(statistik);
				workbook.xlsx.writeFile('Reporting_Transaksi_Abnormal.xlsx');
			})
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.getExcelAbnormal = async (req, res, next) => {
	const trans = req.query.trans;
  const dates = req.query.dates;
  const responses = req.query.responses;

	const conditions = [];

  if (trans.length !== 0){
    conditions.length ? conditions.push(" AND abf.transactions = '"+trans+"'") : conditions.push(" abf.transactions = '"+trans+"'");
  }
  if (dates.length !== 0){
    conditions.length ? conditions.push(" AND CAST(abf.dates AS DATE) = '"+dates+"'") : conditions.push(" CAST(abf.dates AS DATE) = '"+dates+"'");
  }
  if (responses.length !== 0){
    conditions.length ? conditions.push(" AND abf.responses = '"+responses+"'") : conditions.push(" abf.responses = '"+responses+"'");
  }

	try {
    if (trans.length === 0 && dates.length === 0 && responses.length === 0) {
      return res.json({
        'code': 404
      })
    } else {
      buildExcel(conditions);
      return res.json({
        'code': 200,
      });
    }
	} catch (error) {
		logger.error(error);
	}
}

exports.getDownloadExcelAbnormal = async (req, res, next) => {
	try {
		const file = fs.realpathSync('Reporting_Transaksi_Abnormal.xlsx');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}

async function buildTxt(conditions) {
	var q = "SELECT * FROM webadmin.abnormal_bi_fast abf "+
			"WHERE "+ conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				var t = new Table

				for (let i of results.recordset) {
          t.cell('Transaksi', i.transactions)
					t.cell('Tanggal', i.dates ? moment(i.dates).format('L') : '-')
					t.cell('Jam', i.hours)
					t.cell('No Trace', i.trace_num_core_banking)
					t.cell('User ID', i.user_id_core_banking)
          t.cell('Rekening  ', i.rek_core_banking)
					t.cell('E2e / ID Transaksi', i.rintis_transaction_id)
					t.cell('No Referensi', i.rintis_no_ref)
					t.cell('Rekening Sumber', i.rintis_rek_origin)
					t.cell('Rekening Tujuan', i.rintis_rek_destinations)
          t.cell('Nominal', i.nominal)
					t.cell('Respon', i.responses)
					t.newRow()
				}

				fs.writeFile("files/reporting_transaksi_abnormal.txt", t.toString(),"utf8", function(err) {
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

exports.getTextAbnormal = async (req, res, next) => {
	const trans = req.query.trans;
  const dates = req.query.dates;
  const responses = req.query.responses;

	const conditions = [];

  if (trans.length !== 0){
    conditions.length ? conditions.push(" AND abf.transactions = '"+trans+"'") : conditions.push(" abf.transactions = '"+trans+"'");
  }
  if (dates.length !== 0){
    conditions.length ? conditions.push(" AND CAST(abf.dates AS DATE) = '"+dates+"'") : conditions.push(" CAST(abf.dates AS DATE) = '"+dates+"'");
  }
  if (responses.length !== 0){
    conditions.length ? conditions.push(" AND abf.responses = '"+responses+"'") : conditions.push(" abf.responses = '"+responses+"'");
  }

	try {
    if (trans.length === 0 && dates.length === 0 && responses.length === 0) {
      return res.json({
        'code': 404
      })
    } else {
      buildTxt(conditions)
		
      return res.json({
        'code': 200
      })
    }
	} catch (error) {
		logger.error(error)
	}
}

exports.getDownloadTxtAbnormal = async (req, res, next) => {
	try {
		const file = fs.realpathSync('files/reporting_transaksi_abnormal.txt');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}