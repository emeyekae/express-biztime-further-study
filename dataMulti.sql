\c biztime


DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS companies2 CASCADE;
DROP TABLE IF EXISTS industries_companies CASCADE;

CREATE TABLE industries (
    code TEXT PRIMARY KEY,
    industry TEXT NOT NULL
);


CREATE TABLE companies2(
  code TEXT PRIMARY KEY,
  company TEXT NOT NULL
);

CREATE TABLE industries_companies (
  industry_code text NOT NULL REFERENCES industries,
  company_code text NOT NULL REFERENCES companies2,
  PRIMARY KEY(industry_code, company_code)
);

INSERT INTO industries
  VALUES ('browse', 'Internet Browsers'),
         ('compute', 'Computers'),
         ('multi', 'Multi Media'),
         ('ai', 'Artifical Intellegence'),
         ('other', 'Other');

INSERT INTO companies2
  VALUES ('apple', 'Apple Computer'),
         ('ibm', 'IBM'),
         ('google', 'ABC Company'),
         ('firefox', 'Fire Fox'),
         ('netflicks', 'NetFlicks'),
         ('x', 'Company formerly known as Twitter'),
         ('chatgpt', 'ChatGPT');

INSERT INTO industries_companies
  VALUES ('browse', 'google'),
         ('browse', 'firefox'),
         ('compute', 'apple'),
         ('compute', 'ibm'),
         ('ai', 'chatgpt'),
         ('other', 'netflicks'),
         ('ai', 'google'),
         ('multi', 'chatgpt'),
         ('multi', 'x');

