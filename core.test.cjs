const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'..','app.js'),'utf8');
const begin = source.indexOf('  const STOP =');
const finish = source.indexOf('  function renderAnalysis');
const extracted = source.slice(begin, finish);
const sandbox = {Date, Set, Math, String, Object, Array, RegExp};
vm.createContext(sandbox);
vm.runInContext(extracted + '\nthis.core = {tokenize, classify, analyzeReviews, makeSummary};', sandbox);
const core = sandbox.core;

test('classifies clear positive review',()=>assert.equal(core.classify('Excellent quality, amazing product').label,'positive'));
test('classifies clear negative review',()=>assert.equal(core.classify('Broken product, terrible delivery').label,'negative'));
test('neutral review is supported',()=>assert.equal(core.classify('The item arrived yesterday').label,'neutral'));
test('parses dated reviews and groups trend',()=>{const r=core.analyzeReviews('2026-01-01, Great quality\n2026-01-02, Broken and damaged');assert.equal(r.total,2);assert.equal(r.trend.length,2);assert.equal(r.trend[0].date,'2026-01-01');});
test('empty review input returns empty analysis',()=>assert.equal(core.analyzeReviews('  \n ').total,0));
test('summary always contains three action areas',()=>{const r=core.analyzeReviews('great quality\nslow delivery\nbroken item');assert.equal(core.makeSummary(r).actions.length,3);});
