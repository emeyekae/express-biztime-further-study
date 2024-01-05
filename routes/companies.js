
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get('/', async (req, res, next) => {
  try {
    let results = await db.query(`SELECT * FROM companies`);
    return res.json({ "companies": results.rows })
  } catch (e) {
    return next(e);
  }
})


router.post('/', async (req, res, next) => {
  try {
    let {name, description} = req.body;
    let code = slugify(name, {lower: true});
    const results = await db.query(`INSERT INTO companies (code,name,description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    return res.status(201).json({ "company": results.rows[0] });
  } catch (e) {
    return next(e)
  }
})

router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404)
    }
    return res.json({"company": results.rows[0]});
  } catch (e) {
    return next(e)
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    let { code } = req.params;
    const results = await db.query('DELETE FROM companies WHERE code = $1 RETURNING *', [code])
  //  debugger
    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find company with code of ${code}`, 404);
    }
    return res.send({ status: "deleted" })
  } catch (e) {
    return next(e)
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    let code  = req.params.code;
    let resultsCompany =await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`,
    [code]
    );
    let resultsInvoice = await db.query(
          `SELECT id
           FROM invoices
           WHERE comp_code = $1`,
        [code]
    );
    if (resultsCompany.rows.length === 0 ) {
      throw new ExpressError(`Cannot find a company with a code of ${code}`, 404);
    }
    const company = resultsCompany.rows[0];
    const invoices = resultsInvoice.rows;   

    company.invoices = invoices.map(inv => inv.id);

    return res.send({"company":company});
  }
   catch (err) {
    return next(err);
  }
});

module.exports = router;