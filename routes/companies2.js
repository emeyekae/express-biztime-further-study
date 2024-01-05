
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get('/:code', async (req, res, next) => {
  try {
    const results = await db.query(`
    SELECT c.code, c.company, i.industry 
      FROM companies2 AS c 
      LEFT JOIN industries_companies AS ic 
      ON c.code = ic.company_code 
      LEFT JOIN industries AS i 
      ON i.code = ic.industry_code 
      WHERE c.code = $1`, [req.params.code])
    if (results.rows.length === 0 ) {
      throw new ExpressError(`Cannot find a company with a code of ${req.params.code}`, 404);
      }
    const {code, company} = results.rows[0];
    const industry = results.rows.map(r => r.industry);
    res.send({code,company,industry})
  } catch (e) {
  return next(e);
}
})

  module.exports = router;
