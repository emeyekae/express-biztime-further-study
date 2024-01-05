
process.env.NODE_ENV = 'test';

const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async () => {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);

  await db.query(`INSERT INTO companies VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),('ibm', 'IBM', 'Big blue.')`);

  await db.query(`INSERT INTO invoices (id,comp_Code, amt, paid, paid_date) VALUES 
        (1,'apple', 100, false, null),
        (2,'apple', 200, false, null),
        (3,'apple', 300, true, '2018-01-01'),
        (4,'ibm', 400, false, null) RETURNING id`);
})


afterAll(async () => {
  await db.end()
})

describe("GET /", function () {

  test("It should respond with array of invoices", async function () {
    const response = await request(app).get("/invoices");
    expect(response.body).toEqual({
      "invoices": [
        {id: 1, comp_code: "apple", amt: 100, paid: false, add_date: expect.any(String), paid_date: null },
        {id: 2, comp_code: "apple" ,amt: 200, paid: false, add_date:  expect.any(String), paid_date: null},
        {id: 3, comp_code: "apple", amt: 300, paid: true, add_date:  expect.any(String), paid_date: expect.any(String)},
        {id: 4, comp_code: "ibm", amt: 400, paid: false, add_date:  expect.any(String), paid_date: null},
      ]
    });
  })

});

describe("GET /1", function () {

  test("It return invoice info", async function () {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual(
        {
          "invoice": {
            id: 1,
            amt: 100,
            add_date: expect.any(String),
            paid: false,
            paid_date: null,
            company: {
              code: 'apple',
              name: 'Apple Computer',
              description: 'Maker of OSX.',
            }
          }
        }
    );
  });

  test("It should return 404 for no-such-invoice", async function () {
    const response = await request(app).get("/invoices/999");
    expect(response.status).toEqual(404);
  })
});


describe("POST /", function () {

  test("It should add invoice", async function () {
    const response = await request(app)
        .post("/invoices")
        .send({"comp_code":"ibm","amt":500});

    expect(response.body).toEqual(
        {
          "invoice": {
            id: expect.any(Number),
            comp_code: "ibm",
            amt: 500,
            paid: false,
            add_date: expect.any(String),
            paid_date: null,
          }
        }
    );
  });
});


describe("PUT /", function () {

  test("It should update an invoice", async function () {
    const response = await request(app)
        .put("/invoices/1")
        .send({amt: 1000, paid: false});

    expect(response.body).toEqual(
        {
          "invoice": {
            id: 1,
            comp_code: 'apple',
            paid: true,
            amt: 1000,
            add_date: expect.any(String),
            paid_date: expect.any(String),
          }
        }
    );
  });

  test("It should return 404 for no-such-invoice", async function () {
    const response = await request(app)
        .put("/invoices/9999")
        .send({amt: 1000});

    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/invoices/1")
        .send({});

    expect(response.status).toEqual(500);
  })
});


describe("DELETE /", function () {

  test("It should delete invoice", async function () {
    const response = await request(app)
        .delete("/invoices/1");

    expect(response.body).toEqual({"status": "deleted"});
  });

  test("It should return 404 for no-such-invoices", async function () {
    const response = await request(app)
        .delete("/invoices/999");

    expect(response.status).toEqual(404);
  });
});

